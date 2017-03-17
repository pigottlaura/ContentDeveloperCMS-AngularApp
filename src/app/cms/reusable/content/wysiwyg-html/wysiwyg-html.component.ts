import { Component, DoCheck, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wysiwyg-html',
  templateUrl: './wysiwyg-html.component.html',
  styleUrls: ['./wysiwyg-html.component.css']
})
export class WysiwygHtmlComponent implements DoCheck {
  @Input() viewContent:boolean;
  @Output() wysiwygRequestToViewMediaItems:EventEmitter<Function> = new EventEmitter<Function>();
  @Output() wysiwygFileInputChanged:EventEmitter<Object> = new EventEmitter<Object>();
  static staticImageUrl:string;
  private _insertType:string;
  private _imageUrl:string;
  private _headingType:string;
  private _newElement:string;

  // Public method, used as a callback from the content-editor component, when an image
  // is selected from the media-item-gallery
  imageSelected(imageUrl){
    // Storing the resulting imageURL on a static property of this class, as when this
    // method is envoked by the content-editor component, the "this" now refers to the 
    // content-editor component.
    WysiwygHtmlComponent.staticImageUrl = imageUrl;
    console.log(WysiwygHtmlComponent.staticImageUrl);
  }

  ngDoCheck(){
    if(this._imageUrl != WysiwygHtmlComponent.staticImageUrl){
      this._imageUrl = WysiwygHtmlComponent.staticImageUrl;
    }
  }

  private _addImage(){
    this._clear();
    this._insertType = "image";
  }

  private _addHeading(headingType){
    this._clear();
    this._headingType = headingType;
    this._insertType = "heading";
  }

  private _addLink(){
    this._clear();
    this._insertType = "link";
  }

  private _clearAllContent(){
    console.log("Clear all Content");
    this._clear();
  }

  private _fileInputChanged(fileInput:HTMLInputElement){
    if(fileInput.files.length > 0){
      this.wysiwygFileInputChanged.emit({file: fileInput.files[0], callback: this.imageSelected});
    }
  }

  private _viewImages(){
    console.log(typeof this.imageSelected);
    this.wysiwygRequestToViewMediaItems.emit(this.imageSelected);
  }

  private _insertImage(imgFileInput:HTMLInputElement, altTextInput:HTMLInputElement) {
    console.log("Insert Image");
    if(this._imageUrl != null){
      this._newElement = "<img src='" + this._imageUrl + "' alt='" + altTextInput.value + "'>";
      console.log(this._newElement);
      this._clear([imgFileInput, altTextInput]);
    }
  }

  private _insertHeading(hTextInput:HTMLInputElement){
    console.log("Insert Heading - " + this._headingType);
    this._newElement = "<" + this._headingType + ">" + hTextInput.value + "</" + this._headingType + ">";
    console.log(this._newElement);

    this._clear([hTextInput]);
  }

  private _insertLink(linkTextInput:HTMLInputElement, linkHrefInput:HTMLInputElement){
    console.log("Insert Link");
    this._newElement = "<a href='" + linkHrefInput.value + "'>" + linkTextInput.value + "</a>";
    console.log(this._newElement);
    this._clear([linkTextInput, linkHrefInput]);
  }

  private _cancel(){
    this._clear();
  }

  private _clear(inputs:HTMLInputElement[]=[]){
    this._insertType = this._headingType = this._newElement = WysiwygHtmlComponent.staticImageUrl = this._imageUrl = null;
    for(let input of inputs){
      input.value = "";
    }
  }
}
