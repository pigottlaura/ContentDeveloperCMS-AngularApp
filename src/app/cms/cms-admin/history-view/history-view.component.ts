import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-history-view',
  templateUrl: './history-view.component.html',
  styleUrls: ['./history-view.component.css']
})
export class HistoryViewComponent {
  // Inputs to allow these values to be bound to this component
  @Input() projectStructureHistory:Object;
  @Input() projectContentHistory:Object;

  // Outputs to emit events to the admin component, which will bubble up to
  // the cms component (through subsequent event emitters in the cms component)
  @Output() viewRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();

  revertToCommit(revertData){
    // Invoked by a request from a subcomponent to revert to a specific commit,
    // the data for which was included in the event payload

    // Creating a new object, with the commit message included in it,
    // which will be used as the payload for the event
    let updatedData:any = {
      commit_message: revertData.commit_message
    };

    // Adding the appropriate property to the object i.e. "content" or "structure",
    // depending on what the revert was requested for, and setting it 
    updatedData[revertData.for] = revertData.object;

    // Determining which event to emit, based on what the revert request
    // is for i.e. structure or content
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
