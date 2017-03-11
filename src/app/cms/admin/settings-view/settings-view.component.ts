import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent {
  @Input() projectSettings;
  @Output() settingsUpdated:EventEmitter<void> = new EventEmitter<void>();

  constructor(private _cdService:ContentDeveloperServerService){}

  addCollaborator(emailInput, accessLevelIntInput){
    console.log(emailInput.value, accessLevelIntInput.value);
    this._cdService.addNewCollaborator(emailInput.value, accessLevelIntInput.value).subscribe(
      responseObject => {
        console.log("Collaborator added!!");
        emailInput.value = accessLevelIntInput.value = "";
        this.settingsUpdated.emit();
      }
    );  
  }

  deleteCollaborator(collaborator){
    console.log(collaborator);
    this._cdService.removeCollaborator(collaborator.user_id).subscribe(
      responseObject => {
        console.log("Collaborator removed!!");
        this.settingsUpdated.emit();
      }      
    );
  }

  addNewAccessLevel(accessLevelNameInput, accessLevelIntInput){
    var requestedAccessLevel = accessLevelIntInput.value;

    /*
    while(this._accessLevelExists(requestedAccessLevel)){
      requestedAccessLevel++;
    }
    */
    
    this._cdService.createAccessLevel(requestedAccessLevel, accessLevelNameInput.value).subscribe(
      responseObject => {
        console.log("Access level added!!");
        accessLevelIntInput.value = accessLevelNameInput.value = "";
        this.settingsUpdated.emit();
      }
    );
  }

  deleteAccessLevel(accessLevelInt){
    this._cdService.deleteAccessLevel(accessLevelInt).subscribe(
      responseObject => {
        console.log("Access level deleted");
        this.settingsUpdated.emit();
      }
    ); 
  }

  saveAllProjectSettings(){
    this._cdService.updateProjectSettings(
      this.projectSettings.project_name,
      this.projectSettings.max_cache_age,
      this.projectSettings.custom_css
    ).subscribe(
      responseObject => {
        console.log("Project settings updated!!");
        this.settingsUpdated.emit();
    });

    var currentProjectSettings = this._cdService.getCurrentProjectSettings();

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

    if(currentProjectSettings.access_levels != this.projectSettings.access_levels){
      var updatedAccessLevels = []
      for(var accessLevel of this.projectSettings.access_levels){
        for(var i=0; i < currentProjectSettings.access_levels.length; i++){
          if(currentProjectSettings.access_levels[i].access_level_int == accessLevel.access_level_int){
            if(currentProjectSettings.access_levels[i].access_level_name != accessLevel.access_level_name){
              console.log(accessLevel.access_level_name);
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
  }

  private _accessLevelExists(requestedAccessLevelInt){
    var exists:boolean = false;
    for(var i=0; i<this.projectSettings.access_levels; i++){
      if(this.projectSettings.access_levels[i].access_level_int == requestedAccessLevelInt){
        exists = true;
      }
    }
    return exists;
  }

  private _updateAccessLevel(accessLevelInt, accessLevelName){
    if(accessLevelName != null && accessLevelName.length > 0){
      this._cdService.updateAccessLevel(accessLevelInt, accessLevelName).subscribe(
        responseObject => {
          console.log("Access level updated");
          this.settingsUpdated.emit();
        }
      );
    }    
  }

  private _updateCollaboratorAccessLevel(collaborator, accessLevelInt){
    collaborator.access_level_int = accessLevelInt;
    this._cdService.updateCollaborator(collaborator.user_id, accessLevelInt).subscribe(
      responseObject => {
        console.log("Collaborator updated!!");
        this.settingsUpdated.emit();
      }
    );
  }
}
