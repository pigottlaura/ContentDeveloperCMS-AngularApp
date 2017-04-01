import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() user:Object;
  @Input() pageTitle:string;
  @Output() requestToLogout:EventEmitter<void> = new EventEmitter<void>();
  private _loginUrl:string;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
     this._cdService.getLoginUrl().subscribe(
       responseObject => this._loginUrl = responseObject.loginUrl
     );
  }

  logoutClicked(){
    this.requestToLogout.emit();
  }

}
