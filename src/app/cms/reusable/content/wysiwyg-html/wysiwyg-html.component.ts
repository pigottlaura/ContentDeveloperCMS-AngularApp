import { Component, AfterViewInit, OnChanges, Input, Output, EventEmitter, DoCheck, ElementRef } from '@angular/core';

@Component({
  selector: 'app-wysiwyg-html',
  templateUrl: './wysiwyg-html.component.html',
  styleUrls: ['./wysiwyg-html.component.css']
})
export class WysiwygHtmlComponent implements AfterViewInit, OnChanges, DoCheck {
  // Inputs to allow these properties to be bound to this component
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean;
  @Input() itemContent;
  @Input() itemAttributes;
  @Input() encapsulationPath;

  // Outputs to emit events to the parent component
  @Output() wysiwygRequestToViewMediaItems:EventEmitter<Function> = new EventEmitter<Function>();
  @Output() wysiwygContentChanged:EventEmitter<Object> = new EventEmitter<Object>();

  // Creating variables that will only be used within this component
  _insertType:string;
  _imageUrl:string;
  _headingType:string;
  _editableDivElement:HTMLTextAreaElement;
  _cursorPosition;
  _lastChange:string;
  _contentError:string;

  // Injecting the element ref, so that the native div (treated as a textarea, as its
  // content is editable) can be loaded from the DOM
  constructor(private _el:ElementRef) {}

  ngAfterViewInit(){
    // Once the DOM is built, loading the native div that is being used as the input (note - 
    // there are two possible divs that could be loaded - one for view only and one for editing -
    // but only one will ever be in the DOM at a time)
    this._editableDivElement = <HTMLTextAreaElement> this._el.nativeElement.getElementsByClassName("wysiwyg-input")[0];
    // Updating the div to have the content of the item
    this.updateEditableDivToItemContent();
  }

  ngOnChanges(changes){
    if(changes.itemContent){
      // Updating the div to have the content of the item
      this.updateEditableDivToItemContent();
    }
  }

  ngDoCheck(){
    // Checking for content errors on the div input
    if(this._editableDivElement != null && this._editableDivElement.hasAttribute("data-error")){
      this._contentError = this._editableDivElement.getAttribute("data-error");
    } else {
      this._contentError = null;
    }
  }

  updateEditableDivToItemContent(){
    // Checking that the element has been loaded, and that the difference
    // between the item content and current value of the div is more than just
    // " having been changed to '. Allowing users to enter " (but it will be replaced
    // once it leaves this component, so not counting this as a valid differed)
    if(this._editableDivElement != undefined && this._editableDivElement.innerHTML.replace(/\"/g, "'") != this.itemContent){
      // Updating the inner html of the editable div
      this._editableDivElement.innerHTML = this.itemContent; 
      // Updating the cursor positon in the div (can only do this as I am 
      // after explicitly casting the editable div to a "HTMLTextAreaElement")
      this._editableDivElement.selectionStart = this._editableDivElement.selectionEnd = this._cursorPosition;
    }
  }

  undoLastChange(){
    // Allowing users to go back one step in their changes
    if(this._lastChange != null){
      this._editableDivElement.innerHTML = this._lastChange;
      this._lastChange = null;
    }
  }

  updateCursorPosition(){
    // Getting the cursor position of the editable div
    this._cursorPosition = this._getCursorPosition(this._editableDivElement);
    this.updateContent();
  }

  updateContent(){
    // Storing the inner html as the items content (replacing all " with ')
    this.itemContent = this._editableDivElement.innerHTML.toString().replace(/\"/g, "'");
    // Updating the cursor position in the div
    this._editableDivElement.selectionStart = this._editableDivElement.selectionEnd = this._cursorPosition;
    // Emitting the content changed event, with the updated content
    this.wysiwygContentChanged.emit(this.itemContent);
  }

  addImage(){
    // Clearing inputs and hiding other WYSIWYG insert dialogs
    this._clearInputs();
    this._insertType = "image";
  }

  addHeading(headingType){
    // Clearing inputs and hiding other WYSIWYG insert dialogs
    this._clearInputs();
    // Storing the heading type this is for i.e. h1, h2, h3
    this._headingType = headingType;
    // Displaying dialog type for heading
    this._insertType = "heading";
  }

  addLink(){
    // Clearing inputs and hiding other WYSIWYG insert dialogs
    this._clearInputs();
    // Displaying dialog type for link
    this._insertType = "link";
  }

  clearAllContent(){
    // Clearing the content of the div
    this._editableDivElement.innerHTML = "";
    // Updating the item content to match this
    this.updateContent();
    // Clearing inputs and hiding WYSIWYG insert dialogs
    this._clearInputs();
  }

  viewImages(){
    // Emitting the request to view media items event (so the media
    // items gallery will be displayed)
    this.wysiwygRequestToViewMediaItems.emit();
  }

  imageSelected(imageUrl){
    // If an image selected event occurs, storing the image imageUrl
    // so that an img element can be created with it as its src
    this._imageUrl = imageUrl;
  }
  
  insertImage(altTextInput:HTMLInputElement) {
    // Checking that an image url is set (either through a file upload
    // or click on an existing media item)
    if(this._imageUrl != null){
      // Creating a new image element string
      let newImage = "<img src='" + this._imageUrl + "' alt='" + altTextInput.value + "'>";
      // Appending the new image to the existing content (at the
      // point the cursor was last positioned at)
      this.appendToContent(newImage);
      // Clearing the relevant inputs and hiding the WYSIWYG dialogs
      this._clearInputs([altTextInput]);
    }
  }

  insertHeading(hTextInput:HTMLInputElement){
    // Creating a new heading element string
    let newHeading = "<" + this._headingType + ">" + hTextInput.value + "</" + this._headingType + ">";
    // Appending the new heading to the existing content (at the
    // point the cursor was last positioned at)
    this.appendToContent(newHeading);
    // Clearing the relevant inputs and hiding the WYSIWYG dialogs
    this._clearInputs([hTextInput]);
  }

  insertLink(linkTextInput:HTMLInputElement, linkHrefInput:HTMLInputElement){
    // Creating a new link element string
    let newLink = "<a href='" + linkHrefInput.value + "'>" + linkHrefInput.value + "</a>";
    // Appending the new heading to the existing content (at the
    // point the cursor was last positioned at)
    this.appendToContent(newLink);
    // Clearing the relevant inputs and hiding the WYSIWYG dialogs
    this._clearInputs([linkTextInput, linkHrefInput]);
  }

  appendToContent(newElement){
    // Getting the current content of the editable div
    var currentContent = this._editableDivElement.innerHTML;
    // Storing this content as the "last change" value (so it can be undone)
    this._lastChange = this.itemContent;

    // If the content has a "<" in it, then there are HTML element strings
    // already in it. Need to make sure you cant insert another element into a
    // tag of one of these exisiting elements i.e. <h1<img src="**">>Hello World</h1>
    if(currentContent.indexOf("<") > -1){
      // As long as there is an index of < before the cursor, and a > after it, incrementing
      // the cursor position
        while(currentContent.slice(0, this._cursorPosition).lastIndexOf("<") > currentContent.slice(0, this._cursorPosition).lastIndexOf(">")){
            this._cursorPosition++;
        }
    }
    
    // Appending the new element string at the point of the last known
    // cursor position (or ahead of this, if it would have resulted in
    // an element becomming embedded in anothers tag)
    this._editableDivElement.innerHTML = currentContent.slice(0, this._cursorPosition) + newElement + currentContent.slice(this._cursorPosition);
    
    // Updating the cursor position, as it will have jumped to the end (as the entire
    // content was just updated)
    this._editableDivElement.selectionStart = this._editableDivElement.selectionEnd = this._cursorPosition;

    // Updating the items content to match the new content
    this.updateContent();
  }

  cancel(){
    // Clearing all inputs and hiding all WYSIWYG dialogs
    this._clearInputs();
  }

  private _clearInputs(inputs:HTMLInputElement[]=[]){
    // Hiding all WYSIWYG dialogs
    this._insertType = this._headingType = this._imageUrl = null;

    // Clearing any inputs that were passed to the function
    for(let input of inputs){
      input.value = "";
    }
  }

  private _getCursorPosition(element):number {
    // Defaulting the cursor position to be null 
    var cursorPosition = null;
    // Checking if a selection currently exists on the window object
    if(window.getSelection()){
        // Getting the selection object of the window object, to access
        // the currently selected content on the page
        var selectionObject = window.getSelection();

        // Checking if there are ranges currently in the selection object
        if(selectionObject.rangeCount > 0){
            var selectedText = "";

            // Checking if this is a selection of text, or just a cursor position
            if(selectionObject.type.toLowerCase() == "range"){
                // Storing the value of the text that was selected
                selectedText = selectionObject.toString();
            } 

            // Accessing the first range of the selection object, which
            // will be the active selection range
            var selectionRange = selectionObject.getRangeAt(0);

            // Assuming there is no content before the cursor
            var contentBeforeCursor = "";

            // Looping through every child node of the editable div 
            // element (as the HTML element strings will have been
            // converted to HTML elements, and users hitting "enter"
            // will have resulted in additional divs being created)
            for(var i=0; i<element.childNodes.length; i++){
                // Getting the outer HTML of this child node (i.e. the
                // HTML of itself, and its decendancts)
                var nodeContent = element.childNodes[i].outerHTML != undefined ? element.childNodes[i].outerHTML : element.childNodes[i].textContent;
                
                // Checking if this child node is the end container of the selection
                if(element.childNodes[i] == selectionRange.endContainer){
                    // Since this is the end container of the selection, only taking the 
                    // value of its content up as far as the cursor (i.e. the end endOffset
                    // of the selection range)
                    contentBeforeCursor += nodeContent.substring(0, selectionRange.endOffset);
                    // Breaking the loop, so no further content will be appended
                    break;                 
                } else {
                    // Since this is not the end container of the selection, and the loop
                    // has not been broken yet, appending all of its content
                    contentBeforeCursor += nodeContent;
                }
            }

            // The cursor position will be the length of the string, as I have
            // only stored content that would have been appended before it
            cursorPosition = contentBeforeCursor.length;    
        }
    }
    // Returning the cursor position
    return cursorPosition; 
  }
}
