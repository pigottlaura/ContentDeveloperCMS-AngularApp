import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-content-view',
  templateUrl: './content-view.component.html',
  styleUrls: ['./content-view.component.css']
})
export class ContentViewComponent {
  @Input() projectStructure;
  @Input() projectContent;
  @Output() viewRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  requestToSaveProjectContent(contentData){
    this.viewRequestToSaveContent.emit(contentData);
  }

  requestToResetProjectContent(){
    this.viewRequestToResetContent.emit();
  }
}
