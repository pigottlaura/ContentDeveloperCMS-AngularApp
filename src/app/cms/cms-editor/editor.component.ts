import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() projectContent;
  @Input() projectStructure;
  @Input() customCss;
  @Output() editorRequestToSaveContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() editorRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();

  viewRequestToSaveContent(updatedContent=null){
    this.editorRequestToSaveContent.emit(updatedContent);
  }

  viewRequestToResetContent(){
    this.editorRequestToResetContent.emit();
  }
}
