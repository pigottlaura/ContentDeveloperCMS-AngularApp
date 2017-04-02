import { Component, OnChanges, Input, Output, EventEmitter, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnInit, OnChanges {
  @Input() projectStructure;
  @Input() projectContent;
  @Input() projectAccessLevels;
  @Input() userAccessLevel:number;
  @Input() customCss:string;
  @Input() viewOnly:boolean = false;
  @Output() viewRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  private _styleElement:HTMLStyleElement;
  private _viewAsAccessLevel:number;
  
  constructor(private _containerElement:ElementRef) {}

  ngOnInit(){
    this._viewAsAccessLevel = this.userAccessLevel;
  }

  ngOnChanges(changes){
    if(changes.customCss){
      if(this._styleElement == null){
        this._styleElement = document.createElement("style");
        this._styleElement.innerHTML = this.customCss;
        this._containerElement.nativeElement.appendChild(this._styleElement);
      }
      this._styleElement.innerHTML = this.customCss;      
    }
  }

  viewAsAccessLevelChange(accessLevelInt){
    if(accessLevelInt > 1 || (accessLevelInt == 1 && this.userAccessLevel == 1)){
      this._viewAsAccessLevel = parseInt(accessLevelInt);
    }
  }

  requestToSaveProjectContent(contentData){
    this.viewRequestToSaveContent.emit(contentData);
  }

  requestToResetProjectContent(){
    this.viewRequestToResetContent.emit();
  }
}
