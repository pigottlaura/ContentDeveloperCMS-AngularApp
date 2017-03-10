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
  projectContentHistory:Object;
  projectStructureHistory:Object;

  constructor(private _cdService:ContentDeveloperServerService) {}

  ngOnInit() {
    this.loadProjectContentAndStructure();
  }

  loadProjectContentAndStructure(){
    this._cdService.loadProjectContentStructureHistory(this.projectId, this.userId).subscribe(
      responseObject => {
        console.log("Project Content and Structure Loaded!");
        this.resetProjectStructure();
        this.resetProjectContent();
        this.resetProjectHistory();
      }
    );
  }

  saveProjectStructure(structureData){
    let commitMessage = structureData != null ? structureData.commit_message : null;
    console.log("About to save structure");
    this._cdService.updateProjectStructure(this.projectId, this.userId, structureData.structure, commitMessage).subscribe(
    responseObject => {
        console.log("Structure Saved!!");
        this.resetProjectStructure();
        this.resetProjectHistory();
      }
    );
  }

  saveProjectContent(contentData=null){
    let updatedContent = contentData != null && contentData.content != null ? contentData.content : this.projectContent;
    let commitMessage = contentData != null ? contentData.commit_message : null;
    console.log("About to save content");
    console.log(contentData);
    this._cdService.updateProjectContent(this.projectId, this.userId, updatedContent, commitMessage).subscribe(
      responseObject => {
        console.log("Content Saved!!");
        this.resetProjectContent();
        this.resetProjectHistory();
      }
    )
  }

  resetProjectContent(){
    this.projectContent = this._cdService.getCurrentProjectContent();
  }

  resetProjectStructure(){
    this.projectStructure = this._cdService.getCurrentProjectStructure();
  }
  
  resetProjectHistory(){
    console.log("Project History Reset!!");
    this.projectContentHistory = this._cdService.getCurrentProjectContentHistory();
    this.projectStructureHistory = this._cdService.getCurrentProjectStructureHistory();
    //console.log(this.projectStructureHistory[0]);
    //console.log(this.projectContentHistory[0]);
  }
}
