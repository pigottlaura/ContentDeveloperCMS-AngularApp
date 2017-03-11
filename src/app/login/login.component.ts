import { Component, OnInit } from '@angular/core';
import { ContentDeveloperServerService } from "./../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private _loginUrl:string;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
     this._cdService.getLoginUrl().subscribe(
       responseObject => this._loginUrl = responseObject.loginUrl
     );
  }

}
