import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ContentDeveloperServerService {
  private _serverUrl = "http://localhost:3000";
  private _currentProjectData;
  private _headers:Headers;

  constructor(private _http:Http) {
    this._headers = new Headers();
    this._headers.append("user_auth_token", "af5fff5eb926e3edf536789411e8fbe270dda9179d5deedfbfbd890ee53791ec41ac5076e76eac518cc4bba9e089a274b8cad8770e24da9a6af6668bf5eec2c4e7cca32d578f8cec63be747438cd67afc42a7be8a6f301c34220fc3d241d2ecdfdb70775de8981edbbfc7e5f20de8f687a271dce464f7906147cbbb2ee23e96a6eaed316b403b362ae866539b4fcd380278aac39a3ae313bec8a799445619753e1a5402f0a71ff70f1270ac5c97199303d448d207aa7671dc871f54ee55d1dda6e1acdd777542f12a3cecf571c2b2d3773d6c22e246121d7eebca4838f3a65278ccddde601d73d4b14f7b3998922deff409a9b1814554341e52ac2b542de204e1488316642090");
    this._headers.append("Content-Type", "application/json");
  }

  loadProjectContentAndStructure(projectId:number, userId:number){
    console.log("Reloading project content and structure");
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?include=structure,content,history";
    return this._http.get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting project content and structure")
      .do(responseObject => {
        console.log(responseObject);
        this._currentProjectData = responseObject;
      });
  }

  updateProjectStructure(projectId:number, userId:number, projectStructure:Object){
    let requestUrl = this._serverUrl + "/feeds/" + projectId;
    return this._http.put(requestUrl, {structure: projectStructure}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project structure")
      .do(responseObject => {
        console.log(responseObject);
        this._currentProjectData.structure = responseObject;
      });
  }

  updateProjectContent(projectId:number, userId:number, projectContent:Object, encapsulationPath:string=""){
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "/" + encapsulationPath;
    return this._http.put(requestUrl, {content: projectContent}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project contrent")
      .do(responseObject => {
        console.log(responseObject);
      });
  }

  createProjectContent(projectId:number, userId:number, projectContent:Object, encapsulationPath:string=""){
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "/" + encapsulationPath;
    return this._http.post(requestUrl, {content: projectContent}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        console.log(responseObject);
      });
  }

  getCurrentProjectContent(){
    return this._currentProjectData.content;
  }

  getCurrentProjectStructure(){
    return this._currentProjectData.structure;
  }
}
