import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-user-projects',
  templateUrl: './user-projects.component.html',
  styleUrls: ['./user-projects.component.css']
})
export class UserProjectsComponent implements OnInit {
  // Outputs to emit events to the cms component
  @Output() viewProject:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewLoginRequired:EventEmitter<void> = new EventEmitter<void>();
  
  // Variable used within this component only, to pass the list of user
  // projects to the template to be displayed
  _userProjects;

  // Injecting the Content Developer Service service, to allowing this
  // component to load all user projects, and create new projects
  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    // Requesting all user projects to be loaded
    this.refreshUserProjects();
  }

  createNewProject(projectNameInput, template=""){
    // Ensuring an new name has been supplied for the project
    if(projectNameInput.value.length > 0){

      // Creating a new project using the project name and 
      // required template (i.e. website, media items or none)
      this._cdService.createNewProject(projectNameInput.value, template).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Emitting a loginRequired event, to notify the cms component, which will
            // in turn notify the app component
            this.viewLoginRequired.emit();
          } else {
            if(responseObject != null){
              // Using the id of the new project to invoke the edit project 
              // event, so that as soon as it is created, it will be opened for the user
              this.editProject(responseObject.new_project_id, projectNameInput.value, 1);

              // Clearing the project name input
              projectNameInput.value = "";
            }            
          }          
        }
      );
    }    
  }

  editProject(projectId:number, projectName:string, userAccessLevel:number){
    // Creating an object with all the data required to open the project
    let projectData = {
      projectId: projectId,
      projectName:projectName,
      userAccessLevel: userAccessLevel
    }

    // Emitting the event so that the cms component can load the project
    // and display the appropriate editor (depending on the users access level)
    this.viewProject.emit(projectData);
  }

  refreshUserProjects(){
    // Loading all projects belonging to the current user from the 
    // server, through the cdService
    this._cdService.loadUserProjects().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Emitting a loginRequired event, to notify the cms component, which will
          // in turn notify the app component
          this.viewLoginRequired.emit();
        } else {
          this._userProjects = responseObject;
        }
      }
    );
  }
}
