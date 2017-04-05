import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Creating inputs, for the user and page title,
  // so that the values for these can be bound
  // to the component when it is added as a sub-component
  @Input() user:Object;
  @Input() pageTitle:string;

  // Creating an output that emits an event when the user clicks the 
  // logout button
  @Output() requestToLogout:EventEmitter<void> = new EventEmitter<void>();

  // Variable that will only be used within this component, to store logoin url
  _loginUrl:string;

  // Injecting the Content Developer Server service, so that the login
  // can be requested from the server each time this component is initialised
  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    // Getting the login url from the server, using the cdService.
    // The Google login url must be regenerated for each login, so 
    // will always be sourced from the server
    this._cdService.getLoginUrl().subscribe(
      responseObject => {
        if(responseObject != null){
          // Setting the login url equal to the response from the server
          this._loginUrl = responseObject.loginUrl;
        }
    });
  }

  // Invoked by clicks on the "logout" button
  logoutClicked(){
    // Emitting the request to logout event, so that the app component
    // can deal with the logout
    this.requestToLogout.emit();
  }
}
