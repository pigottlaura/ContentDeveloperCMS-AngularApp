import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-wysiwyg-html',
  templateUrl: './wysiwyg-html.component.html',
  styleUrls: ['./wysiwyg-html.component.css']
})
export class WysiwygHtmlComponent {
  @Input() viewContent:boolean;
  @Input() itemContent;
  @Input() itemStructure;
  @Output() wysiwygRequestToViewMediaItems:EventEmitter<Function> = new EventEmitter<Function>();
  @Output() wysiwygContentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  private _insertType:string;
  private _imageUrl:string;
  private _headingType:string;
  private _newElement:string;

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
      this._newElement = "<img src='" + this._imageUrl + "' alt='" + altTextInput.value + "'>";
      console.log(this._newElement);
      this.clear([altTextInput]);
    }
  }

  insertHeading(hTextInput:HTMLInputElement){
    console.log("Insert Heading - " + this._headingType);
    this._newElement = "<" + this._headingType + ">" + hTextInput.value + "</" + this._headingType + ">";
    console.log(this._newElement);

    this.clear([hTextInput]);
  }

  insertLink(linkTextInput:HTMLInputElement, linkHrefInput:HTMLInputElement){
    console.log("Insert Link");
    this._newElement = "<a href='" + linkHrefInput.value + "'>" + linkTextInput.value + "</a>";
    console.log(this._newElement);
    this.clear([linkTextInput, linkHrefInput]);
  }

  cancel(){
    this.clear();
  }

  clear(inputs:HTMLInputElement[]=[]){
    this._insertType = this._headingType = this._newElement = this._imageUrl = null;
    for(let input of inputs){
      input.value = "";
    }
  }
}
