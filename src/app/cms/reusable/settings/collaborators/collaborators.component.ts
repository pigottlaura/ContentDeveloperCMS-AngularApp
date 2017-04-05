import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.css']
})
export class CollaboratorsComponent implements OnInit {
  // Inputs to allow these properties to be bound to this component
  @Input() projectSettings;

  // Outputs to emit events to the parent component
  @Output() collaboratorsUpdated:EventEmitter<void> = new EventEmitter<void>();

  // Variable only used within this component, to ensure that the current
  // user wont see a delete button beside their own name (as you cant delete 
  // yourself from a project - the server wont allow this anyway, but not
  // showing the button to prevent confusion)
  _currentUserId:string;

  // Injecting the Content Developer Server service, to allow this component to
  // add and remove collaborators from the server
  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    // Getting the current user from the cdService, so that their id can
    // be stored for use within this component
    let currentUser:any = this._cdService.getCurrentUser();
    this._currentUserId = currentUser.id;
  }

  addCollaborator(emailInput, accessLevelIntInput){
    // Adding a new collaborator to this project on the server, using the
    // cd service. Including the values of the email and access level inputs
    this._cdService.addNewCollaborator(emailInput.value, accessLevelIntInput.value).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Collaborator added!!");
            // Clearing the email and access level inputs
            emailInput.value = accessLevelIntInput.value = "";
            // Emitting the collaborators update event, so that they can be refreshed
            // from the server
            this.collaboratorsUpdated.emit();
          }
        }
      }
    );  
  }

  deleteCollaborator(collaborator){
    // Requesting to have this collaborator removed from this project
    this._cdService.removeCollaborator(collaborator.user_id).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            console.log("Collaborator removed!!");
            // Emitting the collaborators update event, so that they can be refreshed
            // from the server
            this.collaboratorsUpdated.emit();
          }
        }        
      }      
    );
  }
}
