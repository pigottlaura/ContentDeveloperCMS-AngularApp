import { Component, OnInit } from '@angular/core';
import { ContentDeveloperServerService } from "./services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Creating variables
  user;
  pageTitle:string = "Content Developer CMS";

  // Creating variables that will be used to pass data to sub
  // components, which will contain the data receieved from 
  // timout notifications from the cdService. The session
  // warning dismissed variable will only be used within this
  // component (to determine whether to display the relevant component)
  sessionMinutesRemaining:number = -1;
  sessionExpired:boolean = false;
  _sessionWarningDismissed:boolean = false;

  // Injecting the cdService, so that it can be used within this component
  // to load the user, logout and be notified of timeout warnings
  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    // Setting up the callback function that the cdService will use to 
    // notify this component of a logout occurring anywhere in the app
    this._cdService.setupLogoutCallback(()=>{
      // Calling the login required method, to clear the user object,
      // and reset the page title
      this.loginRequired();
    });

    // Setting up the callback function that the cdService will use to
    // notify this component of a timeout event occuring on their session
    this._cdService.setTimoutWarningCallback((remainingMinutes:number, sessionExpired:boolean)=>{
      // Storing this information if the session is expired, or if the user
      // not yet dismissed the initial warning (i.e. once users dismisses the
      // initial timeout warning, they wont see one again until the session expries)
      if(sessionExpired || this._sessionWarningDismissed == false){
        this.sessionMinutesRemaining = remainingMinutes;
        this.sessionExpired = sessionExpired;
      }      
    });

    // Requesting the cdService to see if there is a user currently logged in,
    // and subscribing the the observable returned to be notified of 
    this._cdService.loadUser().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed
          this.loginRequired();
        } else {
          // Resetting the session timeout variables, as a new session will
          // have been created at login
          this.sessionMinutesRemaining = -1;
          this.sessionExpired = false;
          this._sessionWarningDismissed = false;

          // Storing the current user, as accessed from the cdService
          this.user = this._cdService.getCurrentUser();

          if(this.user.displayName == null){
            // Checking that the user actually contains data, and if
            // not then requiring a login
            this.loginRequired();
          } else {
            // Updating the page title, as the users projects will now be displayed
            this.updatePageTitle("My Projects");
          }
        }
      }
    );
  }

  requestToDismissTimeoutWarning(){
    if(this.sessionExpired){
      // If the session has expired, setting the sessionExpired variable
      // to false, as this variable to false, as this is the only thing
      // keeping the timeout component visible at this point
      this.sessionExpired = false;
      this.logout();
    }
    // Setting the warning dismissed variable to true regarless of whether
    // the session has expired yet (as this will allow the timeout warning
    // to be displayed again if the session expires after the warning is dismissed)
    this._sessionWarningDismissed = true;
    this.sessionMinutesRemaining = -1;
  }

  logout(){
    // Calling the logout method on the cdService, to log the user out of the app
    this._cdService.logout();

    // Calling the login required method, to clear the current user, and reset the page title
    this.loginRequired();
  }

  updatePageTitle(title:string){
    // When invoked by an event in a sub-component (or within this component)
    // this will update the page title
    this.pageTitle = title;
  }

  loginRequired(){
    // Clearing the current user
    this.user = null;
    // Resetting the page title
    this.updatePageTitle("Content Developer CMS");
  }
}
