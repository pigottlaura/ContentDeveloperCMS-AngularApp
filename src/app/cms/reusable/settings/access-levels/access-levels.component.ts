import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-access-levels',
  templateUrl: './access-levels.component.html',
  styleUrls: ['./access-levels.component.css']
})
export class AccessLevelsComponent {
  @Input() projectSettings;
  @Output() accessLevelsUpdated:EventEmitter<void> = new EventEmitter<void>();

  constructor(private _cdService:ContentDeveloperServerService){} 

  addNewAccessLevel(accessLevelNameInput, accessLevelIntInput){
    var requestedAccessLevel = accessLevelIntInput.value;
    
    while(this._accessLevelExists(requestedAccessLevel) || requestedAccessLevel < 4){
      requestedAccessLevel++;
    }
    
    this._cdService.createAccessLevel(requestedAccessLevel, accessLevelNameInput.value).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Access level added!!");
            accessLevelIntInput.value = accessLevelNameInput.value = "";
            this.accessLevelsUpdated.emit();
          }
        }
        
      }
    );
  }

  deleteAccessLevel(accessLevelInt){
    this._cdService.deleteAccessLevel(accessLevelInt).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Access level deleted");
            this.accessLevelsUpdated.emit();
          }
        }
      }
    ); 
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
}
