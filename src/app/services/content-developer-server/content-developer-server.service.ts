import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { CloneObjectPipe } from "./../../pipes/clone-object.pipe";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ContentDeveloperServerService {
  private _serverUrl = "http://localhost:3000";
  private _currentProjectData;
  private _currentProjectSettings;
  private _currentProjectId;
  private _headers:Headers;

  constructor(private _http:Http, private _coPipe:CloneObjectPipe) {
    this._headers = new Headers();
    this._headers.append("user_auth_token", "32614ac97a6c2e2b707786f65313f1a5532a3ab9218b59203751d9f31104e0c0b21b302e26be649bf9939fec6bd1629a2b50241e5302c68e3fcaa9fb838588eca1e0e207c57be33ca411fddf24a572d6ff198af04d4beb056cb8f99f8c7ffd22216ca467102fb29901d4f3abb61f21e9f2164297844c53a6e205ed693bb3ba804f7c955ba4ca8e375b95c710af49a7d1bef7f8f33abec4ea67f884a9943d6d5e7d7b9241e70b316cfe849d892326861b28b1cb996252452d534f2282484fab66a89f0b4e9e7a6295c6170c2b3ead0a5badbefe5b4917a436a35e19ef636effc230c6ceec28998c9a192ddcafe765d3c30d200fff6216dcf147adebb72e0acce81488647819623");
    this._headers.append("Content-Type", "application/json");
  }

  loadProjectContentStructureHistory(projectId:number, userId:number):Observable<Object>{
    console.log("Reloading project content and structure");
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?include=structure,content,history";
    let loadProjectContentAndStructureObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting project content and structure")
      .do(responseObject => {
        this._currentProjectId = projectId;
        this._currentProjectData = responseObject;
        this._currentProjectData.content_history = this._currentProjectData.content_history.all;
        this._currentProjectData.structure_history = this._currentProjectData.structure_history.all;
      });

    return loadProjectContentAndStructureObservable;
  }

  loadProjectSettings(projectId:number, userId:number):Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?allSettings";
    let projectSettingsObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => this._currentProjectSettings = responseObject);

    return projectSettingsObservable;
  }

  updateProjectStructure(projectId:number, userId:number, projectStructure:Object, commitMessage:string=null):Observable<Object>{
    console.log(commitMessage);
    let requestUrl = this._serverUrl + "/feeds/" + projectId;
    let structureUpdateObservable = this._http
      .put(requestUrl, {structure: projectStructure, commit_message: commitMessage},{headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project structure")
      .do(responseObject => {
        this._currentProjectData.structure = responseObject;
        this.refreshProjectHistory(projectId);
      });
    
    return structureUpdateObservable;
  }

  updateProjectContent(projectId:number, userId:number, projectContent:Object, commitMessage:string=null, encapsulationPath:string=""):Observable<Object>{
    console.log(commitMessage);
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "/" + encapsulationPath;
    let contentUpdateObservable = this._http
      .put(requestUrl, {content: projectContent, commit_message: commitMessage}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project content")
      .do(responseObject => {
        if(encapsulationPath.length == 0){
          this._currentProjectData.content = responseObject;
          this.refreshProjectHistory(projectId);
        } else {
          // Deal with encapsulated data
        }        
      });

    return contentUpdateObservable;
  }

  refreshProjectHistory(projectId:number):void{
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?include=history";
    let contentUpdateObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error refreshing project history")
      .do(responseObject => {
        this._currentProjectData.content_history = responseObject.content_history.all;
        this._currentProjectData.structure_hisory = responseObject.structure_history.all;     
      });
  }

  getContentofCommit(commitHash:string, historyOf:string){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=previewCommit&commit_hash=" + commitHash + "&historyof=" + historyOf;
    let commitContentObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting commit content")
      .do(responseObject => {
        switch(historyOf) {
          case "structure": {
            this._currentProjectData.structure = responseObject;
            break;
          }
          case "content": {
            this._currentProjectData.content = responseObject;
            break;
          }
        }
      });
    return commitContentObservable;
  }

  createProjectContent(projectId:number, userId:number, projectContent:Object, encapsulationPath:string=""):Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "/" + encapsulationPath;
    let createContentObservable = this._http
      .post(requestUrl, {content: projectContent}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        console.log(responseObject);
      });

    return createContentObservable;
  }

  getCurrentProjectContent():Object{
    return this._coPipe.transform(this._currentProjectData.content);
  }

  getCurrentProjectStructure():Object{
    return this._coPipe.transform(this._currentProjectData.structure);
  }

  getCurrentProjectSettings():Object{
    return this._coPipe.transform(this._currentProjectSettings);
  }

  getCurrentProjectContentHistory():Object{
    return this._coPipe.transform(this._currentProjectData.content_history);
  }

  getCurrentProjectStructureHistory():Object{
    return this._coPipe.transform(this._currentProjectData.structure_history);
  }
}
