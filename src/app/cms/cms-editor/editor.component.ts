import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() projectContent;
  @Input() projectStructure;
  @Input() projectSettings;
  @Input() customCss;
  @Output() editorRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() editorRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() editorRequestToRefreshSettings:EventEmitter<void> = new EventEmitter<void>();
  private _view:string="content";

  viewRequestToSaveContent(updatedContent=null){
    this.editorRequestToSaveContent.emit(updatedContent);
  }

  viewRequestToResetContent(){
    this.editorRequestToResetContent.emit();
  }

  viewRequestToRefreshSettings(){
    this.editorRequestToRefreshSettings.emit();
  }

  changeView(toView:string){
    this._view = toView;
  }
}
