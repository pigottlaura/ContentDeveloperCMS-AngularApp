import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @Input() projectStructure = {};
  @Input() projectContent = {};
  @Output() adminRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() adminRequestToSaveContent:EventEmitter<void> = new EventEmitter<void>();
  private _view:string = "structure";

  constructor (private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    
  }

  changeView(toView:string){
    this._view = toView;
  }

  resetContent(){
    this.projectContent = this._cdService.getCurrentProjectContent();
  }

  resetStructure(){
    this.projectStructure = this._cdService.getCurrentProjectStructure();
  }

  viewRequestToSaveStructure(updatedStructure){
    this.adminRequestToSaveStructure.emit(updatedStructure);
  }

  viewRequestToSaveContent(){
    this.adminRequestToSaveContent.emit();
  }
}
