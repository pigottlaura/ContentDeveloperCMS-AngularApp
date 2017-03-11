import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-settings-view',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.css']
})
export class SettingsViewComponent {
  @Input() projectSettings;

  addCollaborator(emailAddress, accessLevel){}

  deleteCollaborator(collaborator){}

  updateCollaborator(collaborator, accessLevel){}

  updateAccessLevel(accessLevel){}

  addNewAccessLevel(){
    let newAccessLevelInt: number = this.projectSettings.access_levels.length + 1;
    this.projectSettings.access_levels.push({
      access_level_name: "",
      access_level_int: newAccessLevelInt,
      new: true
    });
  }

  createNewAccessLevel(accessLevel){
    if(accessLevel.access_level_int > 3){
      delete accessLevel.new;
    }
  }

  cancelAddingAccessLevel(accessLevel){
    console.log(accessLevel);
    for(let al in this.projectSettings.access_levels){
      if(this.projectSettings.access_levels[al] == accessLevel){
        this.projectSettings.access_levels.splice(al, 1);
      }
    }
  }

  saveAllProjectSettings(){
    console.log(this.projectSettings);
  }
}
