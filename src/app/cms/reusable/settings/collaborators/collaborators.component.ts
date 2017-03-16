import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.css']
})
export class CollaboratorsComponent implements OnInit {
  @Input() projectSettings;
  @Output() collaboratorsUpdated:EventEmitter<void> = new EventEmitter<void>();
  private _currentUserId:string;

  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    let currentUser:any = this._cdService.getCurrentUser();
    this._currentUserId = currentUser.id;
  }

  addCollaborator(emailInput, accessLevelIntInput){
    console.log(emailInput.value, accessLevelIntInput.value);
    this._cdService.addNewCollaborator(emailInput.value, accessLevelIntInput.value).subscribe(
      responseObject => {
        console.log("Collaborator added!!");
        emailInput.value = accessLevelIntInput.value = "";
        this.collaboratorsUpdated.emit();
      }
    );  
  }

  deleteCollaborator(collaborator){
    console.log(collaborator);
    this._cdService.removeCollaborator(collaborator.user_id).subscribe(
      responseObject => {
        console.log("Collaborator removed!!");
        this.collaboratorsUpdated.emit();
      }      
    );
  }
}
