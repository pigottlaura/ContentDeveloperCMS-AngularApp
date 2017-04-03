import { Component, OnInit } from '@angular/core';
import { ContentDeveloperServerService } from "./services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user;
  pageTitle:string = "Content Developer CMS";
  private _sessionMinutesRemaining:number = -1;
  private _sessionExpired:boolean = false;

  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    this._cdService.setupLogoutCallback(()=>{
      this.loginRequired();
    });

    this._cdService.setTimoutWarningCallback((remainingMinutes:number, sessionExpired:boolean)=>{
      this._sessionMinutesRemaining = remainingMinutes;
      this._sessionExpired = sessionExpired;
    });

    this._cdService.loadUser().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          this.loginRequired();
        } else {
          this._sessionMinutesRemaining = -1;
          this._sessionExpired = false;
          this.user = this._cdService.getCurrentUser();
          if(this.user == {}){
            this.loginRequired();
          } else {
            this.updatePageTitle("My Projects");
          }
        }
      }
    );
  }

  requestToDismissTimeoutWarning(){
    if(this._sessionExpired){
      this.logout();
    } else {
      this._sessionMinutesRemaining = -1;
    }
  }

  logout(){
    this._cdService.logout();
    this.loginRequired();
  }

  updatePageTitle(title:string){
    this.pageTitle = title;
  }

  loginRequired(){
    this.user = null
    this.updatePageTitle("Content Developer CMS");
  }
}
