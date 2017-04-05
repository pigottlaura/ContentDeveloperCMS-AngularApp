import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  // Inputs, to allow these values to be bound to the component
  @Input() projectStructure:Object;
  @Input() projectContent:Object;
  @Input() projectStructureHistory:Object;
  @Input() projectContentHistory:Object;
  @Input() projectSettings:Object;
  @Input() errors:string[];

  // Outputs, to emit events so that the cms component can bind to and deal with them
  // Most of these events occur in subcomponents of this one, but are bubbled up
  // through this component, to reach the cms component
  @Output() adminNotifyingOfProjectDeletion:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() adminRequestToResetStructure:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() adminRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToRefreshSettings:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToDismissErrors:EventEmitter<void> = new EventEmitter<void>();
  
  // Variable used only within this component, to determine which "view"
  // to display to the user - defaulting to "structure"
  _view:string = "structure";

  changeView(toView:string){
    // Changing the "view" for the admin - determines which components to
    // display in the template
    this._view = toView;
  }

  viewRequestToSaveStructure(updatedStructure){
    this.adminRequestToSaveStructure.emit(updatedStructure);
    // Resetting the view to "structure" (as the admin may have been on the 
    // "history" view requesting a revert, and should be taken back to the
    // structure view to see the result)
    this.changeView("structure");
  }

  viewRequestToSaveContent(updatedContent=null){
    this.adminRequestToSaveContent.emit(updatedContent);
    // Resetting the view to "content" (as the admin may have been on the 
    // "history" view requesting a revert, and should be taken back to the
    // content view to see the result)
    this.changeView("content");
  }

  // The following methods are invoked by events emitted from subcomponents, 
  // and are passed through this component to get to the cms component i.e.
  // if a request to reset content reaches this component, bubbling it up
  // to the cms component to deal with
  
  resetContent(){
    this.adminRequestToResetContent.emit();
  }

  viewRequestToResetStructure(){
    this.adminRequestToResetStructure.emit();
  }

  viewRequestToResetContent(){
    this.adminRequestToResetContent.emit();
  }

  viewRequestToRefreshSettings(){
    this.adminRequestToRefreshSettings.emit();
  }

  viewNotifyingOfProjectDeletion(){
    this.adminNotifyingOfProjectDeletion.emit();
  }

  requestToDismissErrors(){
    this.adminRequestToDismissErrors.emit();
  }
}
