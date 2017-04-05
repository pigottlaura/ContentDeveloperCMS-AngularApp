import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-access-levels',
  templateUrl: './access-levels.component.html',
  styleUrls: ['./access-levels.component.css']
})
export class AccessLevelsComponent {
  // Inputs to allow these properties to be bound to this component
  @Input() projectSettings;

  // Outputs to emit events to the parent component
  @Output() accessLevelsUpdated:EventEmitter<void> = new EventEmitter<void>();

  // Injecting the Content Developer Server service, so that this 
  // component can add and remove access levels from the server
  constructor(private _cdService:ContentDeveloperServerService){} 

  addNewAccessLevel(accessLevelNameInput, accessLevelIntInput){
    // Temporarily storing the requested access level
    var requestedAccessLevel = accessLevelIntInput.value;
    
    // So long as the access level already exists on this project, or is less
    // than four, incrementing it, until it is at a unique value (this will
    // be checked serverside aswell, but just checking here to save time)
    while(this._accessLevelExists(requestedAccessLevel) || requestedAccessLevel < 4){
      requestedAccessLevel++;
    }
    
    // Requesting the creation of this access level for the project on the server
    this._cdService.createAccessLevel(requestedAccessLevel, accessLevelNameInput.value).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Access level added!!");
            // Clearing the access level and name input values
            accessLevelIntInput.value = accessLevelNameInput.value = "";
            // Emitting the collaborators update event, so that they can be refreshed
            // from the server
            this.accessLevelsUpdated.emit();
          }
        }
        
      }
    );
  }

  deleteAccessLevel(accessLevelInt){
    // Requesting that this access level be deleted for this project on the server
    this._cdService.deleteAccessLevel(accessLevelInt).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Access level deleted");
            // Emitting the collaborators update event, so that they can be refreshed
            // from the server
            this.accessLevelsUpdated.emit();
          }
        }
      }
    ); 
  }

  private _accessLevelExists(requestedAccessLevelInt){
    // Assuming the access level does not exist until proven otherwise
    var exists:boolean = false;

    // Looping through all of the access levels of the project settings
    for(var i=0; i<this.projectSettings.access_levels; i++){
      // If this access level is equal to the one requested, then it 
      // already exists
      if(this.projectSettings.access_levels[i].access_level_int == requestedAccessLevelInt){
        exists = true;
      }
    }

    // Returning the boolean response to the caller
    return exists;
  }
}
