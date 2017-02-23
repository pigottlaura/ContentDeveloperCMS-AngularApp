import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _userId:number;
  private _accessLevel:number;
  private _projectId:number;
  private _user:Object;

  simulateLogin(){
    this._userId = 1;
    this._user = {
      displayName: "Laura Pigott",
      google_profile_image_url: "https://lh6.googleusercontent.com/-t9ILliXmgR0/AAAAAAAAAAI/AAAAAAAABz8/yQLTE3cHG3E/photo.jpg"
    }
  }

  simulateProject(){
    this._projectId = 1;
    this._accessLevel = 1;
  }
}
