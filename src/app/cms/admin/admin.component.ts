import { Component, Input, Output, EventEmitter} from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  @Input() projectStructure = {};
  @Input() projectContent = {};
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

  viewRequestToSaveContent(){
    this.adminRequestToSaveContent.emit();
  }

  viewRequestToResetContent(){
    this.adminRequestToResetContent.emit();
  }
}
