import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wysiwyg-html',
  templateUrl: './wysiwyg-html.component.html',
  styleUrls: ['./wysiwyg-html.component.css']
})
export class WysiwygHtmlComponent implements AfterViewInit {
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean;
  @Input() itemContent;
  @Input() itemAttributes;
  @Output() wysiwygRequestToViewMediaItems:EventEmitter<Function> = new EventEmitter<Function>();
  @Output() wysiwygContentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  private _insertType:string;
  private _imageUrl:string;
  private _headingType:string;
  private _textareaElement:HTMLTextAreaElement;
  private _cursorPosition;
  private _lastChange:string;

  ngAfterViewInit(){
    this._textareaElement = <HTMLTextAreaElement> document.getElementById("wysiwyg-input");
    if(this._textareaElement != undefined){
      this._textareaElement.innerHTML = this.itemContent;  
    }
  }

  undoLastChange(){
    if(this._lastChange != null){
      this._textareaElement.innerHTML = this._lastChange;
      this._lastChange = null;
    }
  }

  updateCursorPosition(){
    this._cursorPosition = this._getCursorPosition(this._textareaElement);
    this.updateContent();
    //console.log(this._cursorPosition);
  }

  updateContent(){
    this.itemContent = this._textareaElement.innerHTML.toString().replace(/\"/g, "'");
    this.wysiwygContentChanged.emit(this.itemContent);
  }

  addImage(){
    this.clear();
    this._insertType = "image";
  }

  addHeading(headingType){
    this.clear();
    this._headingType = headingType;
    this._insertType = "heading";
  }

  addLink(){
    this.clear();
    this._insertType = "link";
  }

  clearAllContent(){
    console.log("Clear all Content");
    this._textareaElement.innerHTML = "";
    this.updateContent();
    this.clear();
  }

  viewImages(){
    this.wysiwygRequestToViewMediaItems.emit();
  }

  imageSelected(imageUrl){
    this._imageUrl = imageUrl;
    console.log("WYSIWYG - " + this._imageUrl);
  }
  
  insertImage(altTextInput:HTMLInputElement) {
    console.log("Insert Image");
    if(this._imageUrl != null){
      let newImage = "<img src='" + this._imageUrl + "' alt='" + altTextInput.value + "'>";
      console.log(newImage);
      this.appendToContent(newImage);
      this.clear([altTextInput]);
    }
  }

  insertHeading(hTextInput:HTMLInputElement){
    console.log("Insert Heading - " + this._headingType);
    let newHeading = "<" + this._headingType + ">" + hTextInput.value + "</" + this._headingType + ">";
    console.log(newHeading);
    this.appendToContent(newHeading);
    this.clear([hTextInput]);
  }

  insertLink(linkTextInput:HTMLInputElement, linkHrefInput:HTMLInputElement){
    console.log("Insert Link");
    let newLink = "<a href='" + linkHrefInput.value + "'>" + linkHrefInput.value + "</a>";
    console.log(newLink);
    this.appendToContent(newLink);
    this.clear([linkTextInput, linkHrefInput]);
  }

  appendToContent(newElement){
    var currentContent = this._textareaElement.innerHTML;
    this._lastChange = this.itemContent;

    if(currentContent.indexOf("<") > -1){
        while(currentContent.slice(0, this._cursorPosition).lastIndexOf("<") > currentContent.slice(0, this._cursorPosition).lastIndexOf(">")){
            this._cursorPosition++;
        }
    }
    
    this._textareaElement.innerHTML = currentContent.slice(0, this._cursorPosition) + newElement + currentContent.slice(this._cursorPosition);
    this._textareaElement.selectionStart = this._textareaElement.selectionEnd = this._cursorPosition;

    this.updateContent();
    console.log(this._textareaElement.innerHTML);
  }

  cancel(){
    this.clear();
  }

  clear(inputs:HTMLInputElement[]=[]){
    this._insertType = this._headingType = this._imageUrl = null;
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
            // Checking if this is a selection of text, or just a cursor position
            if(selectionObject.type.toLowerCase() == "range"){
                // Storing the value of the text that was selected in the global
                // selectedText variable 
                var selectedText = selectionObject.toString();
            } 

            // Accessing the first range of the selection object, which
            // will be the active selection range
            var selectionRange = selectionObject.getRangeAt(0);

            var contentBeforeCursor = "";

            for(var i=0; i<element.childNodes.length; i++){
                var nodeContent = element.childNodes[i].outerHTML != undefined ? element.childNodes[i].outerHTML : element.childNodes[i].textContent;
                if(element.childNodes[i] == selectionRange.endContainer){
                    contentBeforeCursor += nodeContent.substring(0, selectionRange.endOffset);
                    break;                 
                } else {
                    contentBeforeCursor += nodeContent;
                }
            }
            console.log(contentBeforeCursor);

            cursorPosition = contentBeforeCursor.length;    
        }
    }
    return cursorPosition; 
  }
}
