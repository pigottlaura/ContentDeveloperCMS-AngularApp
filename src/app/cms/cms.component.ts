import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from './../services/content-developer-server/content-developer-server.service';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.css']
})
export class CmsComponent implements OnInit {
  @Input() projectId:number;
  @Input() userId:number;
  @Input() accessLevel: number;

  projectContent:Object;
  projectStructure:Object;

  constructor(private _cdService:ContentDeveloperServerService) {}

  ngOnInit() {
    this.loadProjectContentAndStructure();
  }

  loadProjectContentAndStructure(){
    this._cdService.loadProjectContentAndStructure(this.projectId, this.userId).subscribe(
      responseObject => {
        this.resetProjectStructure();
        this.resetProjectContent();
        console.log("Project Content and Structure Loaded!");
      }
    );
  }

  saveProjectStructure(updatedStructure){
    console.log("About to save structure");
    this._cdService.updateProjectStructure(this.projectId, this.userId, updatedStructure).subscribe(
    responseObject => {
        this.resetProjectStructure();
        console.log("Structure Saved!!");
      }
    );
  }

  saveProjectContent(){
    console.log("About to save content");
    this._cdService.updateProjectContent(this.projectId, this.userId, this.projectContent).subscribe(
      responseObject => {
        this.resetProjectContent();
        console.log("Content Saved!!");
      }
    )
  }

  resetProjectContent(){
    this.projectContent = this._cdService.getCurrentProjectContent();
  }

  resetProjectStructure(){
    this.projectStructure = this._cdService.getCurrentProjectStructure();
  }
}
