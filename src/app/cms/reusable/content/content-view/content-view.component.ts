import { Component, OnChanges, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnChanges {
  // Inputs to allow these properties to be bound to this component
  @Input() projectStructure;
  @Input() projectContent;
  @Input() projectAccessLevels;
  @Input() userAccessLevel:number;
  @Input() customCss:string;
  @Input() viewOnly:boolean = false;

  // Outputs to emit events to the parent component (most of which will bubble
  // up to the cms component)
  @Output() viewRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();

  // Variables used only within this component
  _styleElement:HTMLStyleElement;
  _viewAsAccessLevel:number;
  
    // Injecting the element ref, so that the css style element can be 
    // appended to its native container (to allow custom CSS to control the view)
  constructor(private _containerElement:ElementRef) {}

  ngOnInit(){
    // Defaulting the user to view the content as their own access accessLevelInt
    // (but admin level users of 1 or 2 can choose to change this, to view
    // as other levels using a dropdown)
    this._viewAsAccessLevel = this.userAccessLevel;
  }

  ngOnChanges(changes){
    if(changes.customCss){
      // Checking if the style element already exists
      if(this._styleElement == null){
        // Creating a new style element
        this._styleElement = document.createElement("style");
        // Appending it to the view content native container element
        this._containerElement.nativeElement.appendChild(this._styleElement);
      }
      // Setting the custom CSS as its inner HTML
      this._styleElement.innerHTML = this.customCss;      
    }
  }

  viewAsAccessLevelChange(accessLevelInt){
    // Only level 1 and 2 admins can change their access level view, but 
    // level 2 will never be allowed view as level 1 (only level 1 can)
    if(accessLevelInt > 1 || (accessLevelInt == 1 && this.userAccessLevel == 1)){
      this._viewAsAccessLevel = parseInt(accessLevelInt);
    }
  }

  requestToSaveProjectContent(contentData){
    // Emitting the request to save content event (which will bubble
    // up to the cms component)
    this.viewRequestToSaveContent.emit(contentData);
  }

  requestToResetProjectContent(){
    // Emitting the request to reset content event (which will bubble
    // up to the cms component)
    this.viewRequestToResetContent.emit();
  }
}
