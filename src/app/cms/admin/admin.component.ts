import { Component, Input, Output, EventEmitter} from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  @Input() projectStructure:Object;
  @Input() projectContent:Object;
  @Input() projectStructureHistory:Object;
  @Input() projectContentHistory:Object;
  @Output() adminRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() adminRequestToResetStructure:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() adminRequestToResetContent:EventEmitter<void> = new EventEmitter<void>();
  private _view:string = "structure";

  constructor (private _cdService:ContentDeveloperServerService){}

  changeView(toView:string){
    this._view = toView;
  }

  resetContent(){
    this.adminRequestToResetContent.emit();
  }

  viewRequestToSaveStructure(updatedStructure){
    this.adminRequestToSaveStructure.emit(updatedStructure);
  }

  viewRequestToResetStructure(){
    this.adminRequestToResetStructure.emit();
  }

  viewRequestToSaveContent(updatedContent=null){
    this.adminRequestToSaveContent.emit(updatedContent);
  }

  viewRequestToResetContent(){
    this.adminRequestToResetContent.emit();
  }
}
