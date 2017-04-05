import { Component, Output, EventEmitter, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from './../services/content-developer-server/content-developer-server.service';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.css']
})
export class CmsComponent {
  // Creating outputs, so that requests for updating the page title, or requiring
  // the user to login can be dealt with by the parent component (app component)
  // when they are emitted. Requests to update the page title will have an event 
  // load in the form of a string (i.e. the requested title)
  @Output() requestToUpdatePageTitle:EventEmitter<string> = new EventEmitter<string>();
  @Output() loginRequired:EventEmitter<void> = new EventEmitter<void>();

  // Creating variables that will be shared with child components,
  // to store information relating to the project the user is viewing,
  // as well as any errors that occur when updating it.
  errors:string[];
  projectContent:Object;
  projectStructure:Object;
  projectContentHistory:any[];
  projectStructureHistory:any[];
  projectSettings:any;
  userAccessLevel:number;

  // Creating variables that will only be used within this component
  _projectId:number;
  _projectName:string;

  // Injecting the Content Developer service, so that this component
  // can make requests to the server i.e. to load, update, create and
  // delete content/structure, as well as to "leave" a project
  constructor(private _cdService:ContentDeveloperServerService) {}

  viewProject(projectData){
    // Storing the project id, name and the users access level to it
    this._projectId = projectData.projectId;
    this._projectName = projectData.projectName;
    this.userAccessLevel = projectData.userAccessLevel;

    // Loading this projectts content, structure and settings
    this.loadProjectContentAndStructure();
    this.loadProjectSettings();

    // Updating the page title to the project name
    this.updatePageTitle(this._projectName);
  }

  updatePageTitle(title:string){
    // Emitting the update page title event, with the requested title as the event load
    this.requestToUpdatePageTitle.emit(title);
  }

  dismissErrors(){
    // Resetting the errors array 
    this.errors = [];
  }

  viewUserProjects(){
    // Resetting the project variables
    this._clearProjectVars();

    // Telling the cdService that we are leaving the project 
    // (to clear all project specific data there aswell)
    this._cdService.leaveProject();

    // Resetting the page title to "My Projects"
    this.updatePageTitle("My Projects");
  }

  loadProjectContentAndStructure(){
    // Requesting a load of the project content and structure for this project
    this._cdService.loadProjectContentStructureHistory(this._projectId).subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Emitting a loginRequired event, to notify the app component
          this.loginRequired.emit();
        } else {
          console.log("Project Content and Structure Loaded!");
          this.resetProjectStructure();
          this.resetProjectContent();
          this.resetProjectHistory();
        }
      }
    );
  }

  loadProjectSettings(){
    // Requesting a load of the settings for this project
    this._cdService.loadProjectSettings().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Emitting a loginRequired event, to notify the app component
          this.loginRequired.emit();
        } else {
          this._cdService.loadAdminSettings().subscribe(
            responseObject => {
              if(responseObject.loginRequired){
                // If the responseObject has returned a "loginRequired" property, then
                // the users session must have expired, become invalid or the login failed.
                // Emitting a loginRequired event, to notify the app component
                this.loginRequired.emit();
              } else {
                // Updating the values of the project settings in the app,
                // using the updated data that will now exist in the cdService
                this.resetProjectSettings();
              }              
            }
          );   
        }     
      }
    );
  }

  saveProjectStructure(structureData){
    // Checking if a custom commit message has been included in the event load.
    // If not, then defaulting it to null, as the server will determine the appropriate
    // commit message
    let commitMessage = structureData != null ? structureData.commit_message : null;
    
    // Requesting an update of the project structure on the server, using the cdService
    this._cdService.updateProjectStructure(structureData.structure, commitMessage).subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Emitting a loginRequired event, to notify the app component
          this.loginRequired.emit();
        } else {
          console.log("Structure Saved!!");
          // Updating the project structure and history, using the updated
          // data that will now exist in the cdServer
          this.resetProjectStructure();
          this.resetProjectHistory();
        }

        // Storing any errors returned in the response object, so that they can be
        // displayed to the user. These errors will usually have been resolved server
        // side, but may have resulted in changes to the data that was sent (i.e.
        // during validation). These errors will all be written with a view to displaying
        // them to the user (i.e. no 404 errors)
        this.errors = responseObject.errors;
      }
    );
  }

  saveProjectContent(contentData=null){
    // Checking if content was included in the event payload, and if not, using the
    // content data from this component (as it will have been updated through ngModel
    // bindings). Some data (such as HTML inputs) does not update in this way, so allowing
    // for content to be passed through the event aswell
    let updatedContent = contentData != null && contentData.content != null ? contentData.content : this.projectContent;
    
    // Checking if a custom commit message has been included in the event load.
    // If not, then defaulting it to null, as the server will determine the appropriate
    // commit message
    let commitMessage = contentData != null ? contentData.commit_message : null;

    // Updating the project content on the server through the cdService. Storing
    // the returned value in a temporary variable (as if there are outstanding
    // validation errors on the content, no observable will be returned)
    let updateProjectObservable = this._cdService.updateProjectContent(updatedContent, commitMessage);
    
    // Checking if an observable was returned i.e. the content is allowed to be uploaded
    if(updateProjectObservable != null){
      updateProjectObservable.subscribe(
        (responseObject:any) => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Emitting a loginRequired event, to notify the app component
            this.loginRequired.emit();
          } else {
            console.log("Content Saved!!");
            // Updating the project content and history, using the updated
            // data that will now exist in the cdServer
            this.resetProjectContent();
            this.resetProjectHistory();
          }

          // Storing any errors returned in the response object, so that they can be
          // displayed to the user. These errors will usually have been resolved server
          // side, but may have resulted in changes to the data that was sent (i.e.
          // during validation). These errors will all be written with a view to displaying
          // them to the user (i.e. no 404 errors)
          this.errors = responseObject.errors;
        }
      );
    }
  }

  refreshProject(){
    // Resetting the project content, structure and settings to the value
    // of the corrosponding variables in the cdServer (as these will be the
    // most recent values returned from the server, with no changes made by the
    // user locally included)
    this.loadProjectContentAndStructure();
    this.loadProjectSettings();
  }
  
  resetProjectContent(){
    this.projectContent = this._cdService.getCurrentProjectContent();
  }

  resetProjectStructure(){
    this.projectStructure = this._cdService.getCurrentProjectStructure();
  }
  
  resetProjectSettings(){
    this.projectSettings = this._cdService.getCurrentProjectSettings();

    // Checking that there is a project currently in view, and that
    // there are settings available for it
    if(this._projectId != null && this.projectSettings != null){
      // Updating the project name to that of the project settings
      this._projectName = this.projectSettings.project_name;
      // Updating the page title to the project name
      this.updatePageTitle(this._projectName);
    } else {
      // Since the project settings or project id are now null, then 
      // the server session may have timed out, to emitting the login
      // required event, to notify the app component
      this.loginRequired.emit();
    }
  }

  resetProjectHistory(){
    // Reloading the project history from the server using the cdService
    this._cdService.refreshProjectHistory().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Emitting a loginRequired event, to notify the app component
          this.loginRequired.emit();
        } else {
          console.log("Project History Reset!!");
          // Storing the values within this component
          this.projectContentHistory = responseObject.content_history;
          this.projectStructureHistory = responseObject.structure_history;
        }
      }
    );
  }

  projectDeleted(){
    // Return to the "user-projects" component
    this.viewUserProjects();
  }

  viewLoginRequired(){
    // Emitting the login required event, to notify the app component that the
    // user need to log in again (could be the result of a session timeout)
    this.loginRequired.emit();
  }

  private _clearProjectVars(){
    this._projectId = null;
    this._projectName = null;
    this.userAccessLevel = null;
    this.errors = null;
    this.projectContent = null;
    this.projectStructure = null;
    this.projectContentHistory = null;
    this.projectStructureHistory = null;
    this.projectSettings = null;
    this.userAccessLevel = null;
  }
}
