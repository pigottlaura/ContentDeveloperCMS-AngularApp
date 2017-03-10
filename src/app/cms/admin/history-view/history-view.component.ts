import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.css']
})
export class HistoryViewComponent {
  @Input() projectStructureHistory:Object;
  @Input() projectContentHistory:Object;
  @Output() viewRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();

  revertToCommit(revertData){
    switch(revertData.for){
      case "structure": {
        this.viewRequestToSaveStructure.emit(revertData.object);
        break;
      }
      case "content": {
        this.viewRequestToSaveContent.emit(revertData.object);
        break;
      }
    }
  }
}
