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
    this._cdService.loadUser().subscribe(
      responseObject => {
        this.user = this._cdService.getCurrentUser();
        if(this.user == {}){
          this.user = null;
        }
      }
    )
  }

  logout(){
    this.user = null;
    this._cdService.logout();
  }

  updatePageTitle(title:string){
    this.pageTitle = title;
  }
}
