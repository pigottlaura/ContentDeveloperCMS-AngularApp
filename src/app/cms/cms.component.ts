import { Component, OnInit, Input } from '@angular/core';
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

  constructor(private _cdServer:ContentDeveloperServerService) {}

  ngOnInit() {
    this._cdServer.loadProjectContentAndStructure(this.projectId, this.userId).subscribe(
      responseObject => {
        this.projectContent = responseObject.content;
        this.projectStructure = responseObject.structure;
      }
    );
  }

  saveProjectStructure(updatedStructure){
    if(updatedStructure != null){
      this._cdServer.updateProjectStructure(this.projectId, this.userId, updatedStructure).subscribe(
      responseObject => {
          this.projectStructure = responseObject;
          console.log("Structure Saved!!");
        }
      );
    }
  }

}
