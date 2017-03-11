import { Component, Output, EventEmitter, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from './../services/content-developer-server/content-developer-server.service';

@Component({
  selector: 'app-cms',
  templateUrl: './cms.component.html',
  styleUrls: ['./cms.component.css']
})
export class CmsComponent {
  @Output() requestToUpdatePageTitle:EventEmitter<string> = new EventEmitter<string>();
  projectContent:Object;
  projectStructure:Object;
  projectContentHistory:Object;
  projectStructureHistory:Object;
  projectSettings:Object;

  private _projectId:number;
  private _projectName:string;
  private _userAccessLevel:number;

  constructor(private _cdService:ContentDeveloperServerService) {}

  viewProject(projectData){
    this._projectId = projectData.projectId;
    this._projectName = projectData.projectName;
    this._userAccessLevel = projectData.userAccessLevel;
    this.loadProjectContentAndStructure();
    this.loadProjectSettings();
    this.updatePageTitle(this._projectName);
    
  }

  updatePageTitle(title:string){
    this.requestToUpdatePageTitle.emit(title);
  }

  viewUserProjects(){
    this._projectId = null
    this._userAccessLevel = null;
    this._cdService.leaveProject();
    this.updatePageTitle("My Projects");
  }

  loadProjectContentAndStructure(){
    this._cdService.loadProjectContentStructureHistory(this._projectId).subscribe(
      responseObject => {
        console.log("Project Content and Structure Loaded!");
        this.resetProjectStructure();
        this.resetProjectContent();
        this.resetProjectHistory();
      }
    );
  }

  loadProjectSettings(){
    this._cdService.loadProjectSettings().subscribe(
      responseObject => this.resetProjectSettings());
  }

  saveProjectStructure(structureData){
    let commitMessage = structureData != null ? structureData.commit_message : null;
    console.log("About to save structure");
    this._cdService.updateProjectStructure(structureData.structure, commitMessage).subscribe(
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
    this._cdService.updateProjectContent(updatedContent, commitMessage).subscribe(
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
  
  resetProjectSettings(){
    this.projectSettings = this._cdService.getCurrentProjectSettings();
  }

  resetProjectHistory(){
    console.log("Project History Reset!!");
    this.projectContentHistory = this._cdService.getCurrentProjectContentHistory();
    this.projectStructureHistory = this._cdService.getCurrentProjectStructureHistory();
    //console.log(this.projectStructureHistory[0]);
    //console.log(this.projectContentHistory[0]);
  }
}
