import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  userId:number;
  accessLevel:number;
  projectId:number;
  user:Object;

  simulateLogin(){
    this.userId = 1;
    this.user = {
      displayName: "Laura Pigott",
      google_profile_image_url: "https://lh6.googleusercontent.com/-t9ILliXmgR0/AAAAAAAAAAI/AAAAAAAABz8/yQLTE3cHG3E/photo.jpg"
    }
  }

  simulateProject(){
    this.projectId = 1;
    this.accessLevel = 1;
  }
}
