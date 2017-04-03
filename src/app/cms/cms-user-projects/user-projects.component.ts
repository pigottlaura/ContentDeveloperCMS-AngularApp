import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-user-projects',
  templateUrl: './user-projects.component.html',
  styleUrls: ['./user-projects.component.css']
})
export class UserProjectsComponent implements OnInit {
  @Output() viewProject:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewLoginRequired:EventEmitter<void> = new EventEmitter<void>();
  private _userProjects;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    this.refreshUserProjects();
  }

  createNewProject(projectNameInput, template=""){
    if(projectNameInput.value.length > 0){
      this._cdService.createNewProject(projectNameInput.value, template).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this.viewLoginRequired.emit();
          } else {
            if(responseObject != null){
              this.editProject(responseObject.new_project_id, projectNameInput.value, 1);
              projectNameInput.value = "";
            }            
          }          
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

  refreshUserProjects(){
    this._cdService.loadUserProjects().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          this.viewLoginRequired.emit();
        } else {
          this._userProjects = responseObject;
        }
      }
    );
  }
}
