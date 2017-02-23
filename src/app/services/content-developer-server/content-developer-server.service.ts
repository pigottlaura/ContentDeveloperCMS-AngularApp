import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ContentDeveloperServerService {
  private _serverUrl = "http://localhost:3000";
  private _currentProjectData;

  constructor(private _http:Http) {}

  loadProjectContentAndStructure(projectId:number, userId:number){
    console.log("Reloading project content and structure");
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?userID=" + userId;

    return this._http.get(requestUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting project content and structure")
      .do(responseObject => this._currentProjectData = responseObject);
  }

  getCurrentProjectContent(){
    return this._currentProjectData.content;
  }

  getCurrentProjectStructure(){
    return this._currentProjectData.structure;
  }
}
