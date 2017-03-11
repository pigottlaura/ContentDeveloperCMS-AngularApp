import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-user-projects',
  templateUrl: './user-projects.component.html',
  styleUrls: ['./user-projects.component.css']
})
export class UserProjectsComponent implements OnInit {
  @Output() viewProject:EventEmitter<Object> = new EventEmitter<Object>();
  private _userProjects;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    this._cdService.loadUserProjects().subscribe(
      responesObject => {
        this._userProjects = responesObject;
        console.log(this._userProjects);
      }
    )
  }

  editProject(projectId:number, userAccessLevel:number){
    let projectData = {
      projectId: projectId,
      userAccessLevel: userAccessLevel
    }
    this.viewProject.emit(projectData);
  }

}
