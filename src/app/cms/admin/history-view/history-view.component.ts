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
    let updatedData:any = {};
    updatedData.commit_message = revertData.commit_message;
    updatedData[revertData.for] = revertData.object;

    switch(revertData.for){
      case "structure": {
        this.viewRequestToSaveStructure.emit(updatedData);
        break;
      }
      case "content": {
        this.viewRequestToSaveContent.emit(updatedData);
        break;
      }
    }
  }
}
