import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent implements OnInit {
  // Inputs to allow these properties to be bound to this component
  @Input() isAdmin:boolean = false;
  @Input() projectSettings;

  // Outputs to emit events to the parent component (most of which will bubble
  // up to the cms component)
  @Output() settingsUpdated:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToRefreshSettings:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewNotifyingOfProjectDeletion:EventEmitter<void> = new EventEmitter<void>();

  // Creating a variable that will only be used within this component,
  // to display within the project credentials
  _projectId;

  // Injecting the Content Developer Server service into the constructor,
  // so this component can load and update project settings on the server
  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    // Setting the project id to be equal to the current project id from
    // the cdService
    this._projectId = this._cdService.getCurrentProjectId();
  }
  
  deleteProject(projectName){
    // Checking that this user is an admin, and that the project name they
    // have entered matches the current projects name (both checks
    // will also occur on the server)
    if(this.isAdmin && projectName == this.projectSettings.project_name){
      // Requesting that this project be deleted from the server, using the
      // cdService. Including the project name the user entered, to be used
      // for validation on the server
      this._cdService.deleteProject(projectName).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            if(responseObject.success){
              console.log("Project deleted");
              // Emitting the project deleted event, so that the app will return
              // to the "cms-user-projects" component
              this.viewNotifyingOfProjectDeletion.emit();
            }
          }          
        }
      )
    }
  }

  generateNewPublicAuthToken(currentAuthTokenInput){
    // Checking that this user is an admin, and that the value for the public auth token
    // they entered, matches the projects public auth token (these checks will occur on the
    // server aswell)
    if(this.isAdmin && currentAuthTokenInput.value == this.projectSettings.public_auth_token){
      // Requesting a new public auth token to be generated. Including the value entered
      // for the current public auth token for validation server side
      this._cdService.generateNewPublicAuthToken(currentAuthTokenInput.value).subscribe(
        (responseObject:any) => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            if(responseObject.success){
              // Clearing the current auth token input
              currentAuthTokenInput.value = "";

              // Emitting the settings updated event, so that they can be reloaded from the server
              this.settingsUpdated.emit();
            }
          }
        }
      )
    }
  }

  updateSettings(){
    // Notifying the parent of the settings being updated
    this.settingsUpdated.emit();
  }
  
  resetAllProjectSettings(){
    // Emitting the refresh settings event, which will bubble up
    // to the cms component
    this.viewRequestToRefreshSettings.emit();
  }

  saveAllProjectSettings(){
    // Getting the current project settings from the server
    var currentProjectSettings = this._cdService.getCurrentProjectSettings();
    
    // Checking if this user is an admin, as they will be able to update
    // more settings than other users
    if(this.isAdmin){
      // Requesting the update of the project name, cache age and custom css
      // on the server
      this._cdService.updateProjectSettings(
        this.projectSettings.project_name,
        this.projectSettings.max_cache_age,
        this.projectSettings.custom_css
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            // Emitting the settings updated event, so they can be refreshed from the server
            this.settingsUpdated.emit();
          }
        }
      );

      // Requesting the update origins and read origins settings to be updated
      // on the server, using the cd Service
      this._cdService.updateAdminSettings(
        this.projectSettings.update_origins,
        this.projectSettings.read_origins
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            // Emitting the settings updated event, so they can be refreshed from the server
            this.settingsUpdated.emit();
          }
        }
      );

      // Checking if the most recently loaded access levels from the server 
      // match the access levels in this component 
      if(currentProjectSettings.access_levels != this.projectSettings.access_levels){
        // Creating a temporary array to store the access levels that
        // need to be updated on the server
        var updatedAccessLevels = [];

        // Looping through all of the access levels in this component
        for(var accessLevel of this.projectSettings.access_levels){
          // Looping through all of the most recently loaded access levels (from the server)
          for(var i=0; i < currentProjectSettings.access_levels.length; i++){
            // Finding the matching access levels i.e. the local level 1 and the server leve 1
            if(currentProjectSettings.access_levels[i].access_level_int == accessLevel.access_level_int){
              // Checking that their names still match
              if(currentProjectSettings.access_levels[i].access_level_name != accessLevel.access_level_name){
                // If the names no longer match, then this access level need to be updated.
                // Adding this to the updated access levels array, so a request
                // can be sent to the server to update it
                updatedAccessLevels.push(accessLevel);
              }
            }
          }
        }
        
        // Looping through all the access levels that were identified as having been changed
        for(var updatedAL of updatedAccessLevels){
          // Calling this components update access level method
          this._updateAccessLevel(updatedAL.access_level_int, updatedAL.access_level_name);
        }
      }
    } else {
      // If this user is not an admin, they can only update the project name
      this._cdService.updateProjectSettings(
        this.projectSettings.project_name
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            // Emitting the settings updated event, so they can be refreshed from the server
            this.settingsUpdated.emit();
          }
      });
    }

    // Checking that the most recently loaded collaborators from the server
    // match with the collaborators of this component
    if(currentProjectSettings.collaborators != this.projectSettings.collaborators){
      // Creating a temporary array to store collaborators that require an update
      var updatedCollaborators = [];
      
      // Looping through all collaborators of this component
      for(var collaborator of this.projectSettings.collaborators){
        // Checking that it has a user id
        if(collaborator.user_id != null){
          // Looping through all collaborators from the most recent load from the server
          for(var i=0; i < currentProjectSettings.collaborators.length; i++){
            // Finding the equilivant user i.e. local user A and server user A
            if(currentProjectSettings.collaborators[i].user_id == collaborator.user_id){
              // Checking that their access level int is still the same
              if(currentProjectSettings.collaborators[i].access_level_int != collaborator.access_level_int){
                // Since this collaborators access level int seems to have changed,
                // adding them to the updated collaborators array so that a request can
                // be sent to the server to update them
                updatedCollaborators.push(collaborator);
              }
            }
          }
        }
      }
      
      // Looping through the array of collaborators that need to be updated
      for(var updatedCollab of updatedCollaborators){
        // Calling this components update access level method
        this._updateCollaboratorAccessLevel(updatedCollab, updatedCollab.access_level_int);
      }
    }
  }

  private _updateAccessLevel(accessLevelInt, accessLevelName){
    // Checking that the requested access level name is not empty
    if(accessLevelName != null && accessLevelName.length > 0){
      // Requesting this access level to be updated on the server
      this._cdService.updateAccessLevel(accessLevelInt, accessLevelName).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout on the cdService, so that the app can force a login
            this._cdService.logout();
          } else {
            if(responseObject.success){
              console.log("Access level updated");
              // Emitting the settings updated event, so they can be refreshed from the server
              this.settingsUpdated.emit();
            }
          }
        }
      );
    }    
  }

  private _updateCollaboratorAccessLevel(collaborator, accessLevelInt){
    // Setting the collaborators access level int to be equal to that of the requested change
    collaborator.access_level_int = accessLevelInt;
    // Requesting this collaborator to be updated on the server
    this._cdService.updateCollaborator(collaborator.user_id, accessLevelInt).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Collaborator updated!!");
            // Emitting the settings updated event, so they can be refreshed from the server
            this.settingsUpdated.emit();
          }
        }        
      }
    );
  }
}
