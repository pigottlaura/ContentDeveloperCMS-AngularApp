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

  constructor(private _cdService:ContentDeveloperServerService){}

  ngOnInit(){
    this._cdService.setupLogoutObservable(()=>{
      this.loginRequired();
    });

    this._cdService.loadUser().subscribe(
      (responseObject:any) => {
        if(responseObject.loginRequired){
          this.loginRequired();
        } else {
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
