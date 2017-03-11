import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-user-projects',
  templateUrl: './user-projects.component.html',
  styleUrls: ['./user-projects.component.css']
})
export class UserProjectsComponent implements OnInit {
  @Output() viewProject:EventEmitter<Object> = new EventEmitter<Object>();
  private _userProjects;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    this._cdService.loadUserProjects().subscribe(
      responesObject => this._userProjects = responesObject
    );
  }

  createNewProject(projectNameInput, template=""){
    if(projectNameInput.value.length > 0){
      this._cdService.createNewProject(projectNameInput.value, template).subscribe(
        responseObject => {
          this.editProject(responseObject.new_project_id, projectNameInput.value, 1);
          projectNameInput.value = "";
        }
      );
    }    
  }

  editProject(projectId:number, projectName:string, userAccessLevel:number){
    let projectData = {
      projectId: projectId,
      projectName:projectName,
      userAccessLevel: userAccessLevel
    }
    this.viewProject.emit(projectData);
  }

}
