import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent implements OnInit {
  @Input() isAdmin:boolean = false;
  @Input() projectSettings;
  @Output() settingsUpdated:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewRequestToRefreshSettings:EventEmitter<void> = new EventEmitter<void>();
  @Output() viewNotifyingOfProjectDeletion:EventEmitter<void> = new EventEmitter<void>();
  private _projectId;

  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    this._projectId = this._cdService.getCurrentProjectId();
  }
  
  deleteProject(projectName){
    if(this.isAdmin && projectName == this.projectSettings.project_name){
      this._cdService.deleteProject(projectName).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            if(responseObject.success){
              this.viewNotifyingOfProjectDeletion.emit();
              console.log("Project deleted");
            }
          }          
        }
      )
    }
  }

  generateNewPublicAuthToken(currentAuthTokenInput){
    if(this.isAdmin && currentAuthTokenInput.value == this.projectSettings.public_auth_token){
      this._cdService.generateNewPublicAuthToken(currentAuthTokenInput.value).subscribe(
        (responseObject:any) => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            if(responseObject.success){
              currentAuthTokenInput.value = "";
              this.settingsUpdated.emit();
            }
          }
        }
      )
    }
  }

  updateSettings(){
    this.settingsUpdated.emit();
  }
  
  resetAllProjectSettings(){
    this.viewRequestToRefreshSettings.emit();
  }

  saveAllProjectSettings(){
    var currentProjectSettings = this._cdService.getCurrentProjectSettings();
    
    if(this.isAdmin){
      this._cdService.updateProjectSettings(
        this.projectSettings.project_name,
        this.projectSettings.max_cache_age,
        this.projectSettings.custom_css
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            this.settingsUpdated.emit();
          }
        }
      );

      this._cdService.updateAdminSettings(
        this.projectSettings.update_origins,
        this.projectSettings.read_origins
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            this.settingsUpdated.emit();
          }
        }
      );

      if(currentProjectSettings.access_levels != this.projectSettings.access_levels){
        var updatedAccessLevels = []
        for(var accessLevel of this.projectSettings.access_levels){
          for(var i=0; i < currentProjectSettings.access_levels.length; i++){
            if(currentProjectSettings.access_levels[i].access_level_int == accessLevel.access_level_int){
              if(currentProjectSettings.access_levels[i].access_level_name != accessLevel.access_level_name){
                updatedAccessLevels.push(accessLevel);
              }
            }
          }
        }
        
        for(var updatedAL of updatedAccessLevels){
          console.log("Updating Access Level - int:" + updatedAL.access_level_int);
          this._updateAccessLevel(updatedAL.access_level_int, updatedAL.access_level_name);
        }
      }
    } else {
      this._cdService.updateProjectSettings(
        this.projectSettings.project_name
      ).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            this.settingsUpdated.emit();
          }
      });
    }

    if(currentProjectSettings.collaborators != this.projectSettings.collaborators){
      var updatedCollaborators = []
      for(var collaborator of this.projectSettings.collaborators){
        if(collaborator.user_id != null){
          for(var i=0; i < currentProjectSettings.collaborators.length; i++){
            if(currentProjectSettings.collaborators[i].user_id == collaborator.user_id){
              if(currentProjectSettings.collaborators[i].access_level_int != collaborator.access_level_int){
                updatedCollaborators.push(collaborator);
              }
            }
          }
        }
      }
      
      for(var updatedCollab of updatedCollaborators){
        console.log("Updating Collaborator - id:" + updatedCollab.user_id);
        this._updateCollaboratorAccessLevel(updatedCollab, updatedCollab.access_level_int);
      }
    }
  }

  private _updateAccessLevel(accessLevelInt, accessLevelName){
    if(accessLevelName != null && accessLevelName.length > 0){
      this._cdService.updateAccessLevel(accessLevelInt, accessLevelName).subscribe(
        responseObject => {
          if(responseObject.loginRequired){
            this._cdService.logout();
          } else {
            if(responseObject.success){
              console.log("Access level updated");
              this.settingsUpdated.emit();
            }
          }
        }
      );
    }    
  }

  private _updateCollaboratorAccessLevel(collaborator, accessLevelInt){
    collaborator.access_level_int = accessLevelInt;
    this._cdService.updateCollaborator(collaborator.user_id, accessLevelInt).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Collaborator updated!!");
            this.settingsUpdated.emit();
          }
        }        
      }
    );
  }
}
