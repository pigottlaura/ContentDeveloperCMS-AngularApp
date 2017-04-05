import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  // Inputs to allow these values to be bound to this component
  @Input() projectContent;
  @Input() projectStructure;
  @Input() projectSettings;
  @Input() projectContentHistory;
  @Input() userAccessLevel:number;
  @Input() customCss;
  @Input() errors:string[];

  // Outputs to emit events to the cms component
  @Output() editorRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() editorRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() editorRequestToRefreshSettings:EventEmitter<void> = new EventEmitter<void>();
  @Output() editorRequestToDismissErrors:EventEmitter<void> = new EventEmitter<void>();
  
  // Variable used only within this component, to determine which "view"
  // to display to the user - defaulting to "content"
  _view:string="content";

  changeView(toView:string){
    // Changing the "view" for the admin - determines which components to
    // display in the template
    this._view = toView;
  }

  previewCommit(previewData){
    this.projectContent = previewData.data;
    // Resetting the view to "content" (as the admin may have been on the 
    // "history" view requesting a revert, and should be taken back to the
    // content view to see the result)
    this.changeView("content");
  }

  // The following methods are invoked by events emitted from subcomponents, 
  // and are passed through this component to get to the cms component i.e.
  // if a request to reset content reaches this component, bubbling it up
  // to the cms component to deal with

  viewRequestToSaveContent(updatedContent=null){
    this.editorRequestToSaveContent.emit(updatedContent);
  }

  viewRequestToResetContent(){
    this.editorRequestToResetContent.emit();
  }

  viewRequestToRefreshSettings(){
    this.editorRequestToRefreshSettings.emit();
  }

  requestToDismissErrors(){
    this.editorRequestToDismissErrors.emit();
  }
}
