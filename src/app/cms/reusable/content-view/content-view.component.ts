import { Component, OnChanges, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent implements OnChanges {
  @Input() projectStructure;
  @Input() projectContent;
  @Input() customCss:string;
  @Output() viewRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  private _styleElement:HTMLStyleElement;

  constructor(private _containerElement:ElementRef) {}

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

  requestToSaveProjectContent(contentData){
    this.viewRequestToSaveContent.emit(contentData);
  }

  requestToResetProjectContent(){
    this.viewRequestToResetContent.emit();
  }
}
