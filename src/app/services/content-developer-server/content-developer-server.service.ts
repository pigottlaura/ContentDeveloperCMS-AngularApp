import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { CloneObjectPipe } from "./../../pipes/clone-object.pipe";
import { KeyValArrayPipe } from "./../../pipes/key-val-array.pipe";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ContentDeveloperServerService {
  private _serverUrl = "./..";
  private _currentProjectContentStructureHistory;
  private _currentProjectSettings;
  private _currentProjectId;
  private _currentUser;
  private _headers:Headers;
  private _contentErrors:any = {};
  private _notifyAppComponentOfLogout:Function;
  private _notifyAppComponentOfImpendingTimeout:Function;
  private _activeSessionInterval;
  private _activeSessionTime;
  private _serverSessionMaxSeconds:number = 30; //60 * 30
  private _warnTimeoutAt:number = 0.80; // Percentage of server session max time
  private _warnTimeoutSent:boolean = false;

  constructor(private _http:Http, private _coPipe:CloneObjectPipe, private _kvaPipe:KeyValArrayPipe) {
    this._headers = new Headers();
    this._headers.append("Content-Type", "application/json");
  }

  getContentErrors():any {
    return this._coPipe.transform(this._contentErrors);
  }

  updateContentError(propertyName:string, value:string){
    this._contentErrors[propertyName] = value;
  }

  deleteContentError(propertyName){
    delete this._contentErrors[propertyName];
  }

  clearContentErrors(){
    this._contentErrors = {};
  }

  setupLogoutCallback(appComponentLogoutFunction:Function):void{
    this._notifyAppComponentOfLogout = appComponentLogoutFunction;
  }

  setTimoutWarningCallback(appComponentTimoutWarningFunction:Function):void{
    this._notifyAppComponentOfImpendingTimeout = appComponentTimoutWarningFunction;
  }
  
  getLoginUrl():Observable<any>{
    let requestUrl = this._serverUrl + "/admin/loginUrl";
    let getLoginUrlObservable = this._http
      .get(requestUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error getting login url")
      .do(responseObject=> responseObject.loginUrl);
      
    return getLoginUrlObservable;
  }
  
  loadUser():Observable<Object> {
    let requestUrl = this._serverUrl + "/admin/user";
    let loadUserObservable = this._http
      .get(requestUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error getting users details")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          this._activeSessionInterval = setInterval(()=>{
            this._activeSessionTime++;
            if(this._activeSessionTime > this._serverSessionMaxSeconds) {
              this._stopIntervalTimer();
              this._notifyAppComponentOfImpendingTimeout(0, true);
              console.log("Your session has expired");
            } else if(!this._warnTimeoutSent){
              if(this._activeSessionTime > (this._serverSessionMaxSeconds * this._warnTimeoutAt)){
                var remainingMinutes = (this._serverSessionMaxSeconds - this._activeSessionTime) / 60;
                if(remainingMinutes >= 0){
                  this._notifyAppComponentOfImpendingTimeout(remainingMinutes, false);
                  this._warnTimeoutSent = true;
                }
              }
            }
          }, 1000);
          this._currentUser = responseObject.user
        }
      });
    return loadUserObservable;
  }

  private _resetIntervalTimer(){
    this._activeSessionTime = 0;
  }

  private _stopIntervalTimer(){
    this._activeSessionTime = 0;
    clearInterval(this._activeSessionInterval);
    this._warnTimeoutSent = false;
  }

  logout(){  
    this._stopIntervalTimer();  
    let logoutUrl = this._serverUrl + "/admin/logout";
    let logoutObservable = this._http
      .get(logoutUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error when logging user out");

    logoutObservable.subscribe(
      responseObject => {
        clearInterval(this._activeSessionInterval);
        this._notifyAppComponentOfLogout();
        console.log("User logged out");
      }
    );

    this._currentUser = null;
    
    this.leaveProject();
  }

  loadUserProjects():Observable<Object> {
    let requestUrl = this._serverUrl + "/feeds/?action=collaborators";
    let loadUserProjectsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting users projects")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
        }
      });
    return loadUserProjectsObservable;
  }

  loadProjectContentStructureHistory(projectId:number):Observable<Object>{
    this._currentProjectId = projectId;
    console.log("Reloading project content and structure");
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?include=structure,content,history";
    let loadProjectContentAndStructureObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting project content and structure")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          this._currentProjectContentStructureHistory = responseObject;
        }
      });

    return loadProjectContentAndStructureObservable;
  }

  loadProjectSettings():Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?allSettings";
    let loadProjectSettingsObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          this._currentProjectSettings = responseObject;
        }
      });

    return loadProjectSettingsObservable;
  }

  updateProjectSettings(projectName=null, maxCacheAge=null, customCss=null){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?allSettings";
    let updateProjectSettingsObservable =  this._http
      .put(requestUrl, {project_name: projectName, max_cache_age: maxCacheAge, custom_css: customCss}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          console.log("Project settings updated!!");
        }
      });

    return updateProjectSettingsObservable;
  }
  
  loadAdminSettings(){
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId;
    let loadAdminSettingsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject != null){
            this._currentProjectSettings.update_origins = responseObject.update_origins;
            this._currentProjectSettings.read_origins = responseObject.read_origins;
            this._currentProjectSettings.public_auth_token = responseObject.public_auth_token;
          }
        }
      });

    return loadAdminSettingsObservable;
  }

  updateAdminSettings(updateOrigins=null, readOrigins=null):Observable<any>{
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId;
    let updateProjectSettingsObservable =  this._http
      .put(requestUrl, {update_origins: updateOrigins, read_origins: readOrigins}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          console.log("Admin settings updated!!")
        }
      });

    return updateProjectSettingsObservable;
  }

  generateNewPublicAuthToken(currentAuthToken){
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId + "/publicAuthToken";
    let generateNewPublicAuthTokenObservable = this._http
      .put(requestUrl, {public_auth_token: currentAuthToken}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.success){
            this._currentProjectSettings.public_auth_token = responseObject.public_auth_token;
            console.log("New public auth token generated!!");
          }
        }
      });

    return generateNewPublicAuthTokenObservable;
  }

  updateProjectStructure(projectStructure:Object, commitMessage:string=null):Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId;
    let structureUpdateObservable = this._http
      .put(requestUrl, {structure: projectStructure, commit_message: commitMessage},{headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project structure")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject != null){
            this._currentProjectContentStructureHistory.structure = responseObject.structure;
          }
        }
      });
    
    return structureUpdateObservable;
  }

  updateProjectContent(projectContent:Object, commitMessage:string=null, encapsulationPath:string=""):Observable<Object>{
    if(this._kvaPipe.transform(this._contentErrors, "values").length == 0){
      let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "/" + encapsulationPath;
      let contentUpdateObservable = this._http
        .put(requestUrl, {content: projectContent, commit_message: commitMessage}, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error updating project content")
        .do(responseObject => {
            if(responseObject.loginRequired){
              this.logout();
            } else {
              this._resetIntervalTimer();
              if(responseObject != null){
                this._currentProjectContentStructureHistory.content = responseObject.content;
              }
          }    
        });

      return contentUpdateObservable;
    } else {
      return null;
    }
    
  }

  refreshProjectHistory():Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?include=history";
    let refreshProjectHistoryObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error refreshing project history")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(this._currentProjectContentStructureHistory != null && responseObject != null){
            this._currentProjectContentStructureHistory.content_history = responseObject.content_history;
            this._currentProjectContentStructureHistory.structure_hisory = responseObject.structure_history; 
          }   
        }         
      });
    return refreshProjectHistoryObservable;
  }

  getContentofCommit(commitHash:string, historyOf:string){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=previewCommit&commitHash=" + commitHash + "&historyOf=" + historyOf;
    let commitContentObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting commit content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
        }
      });

    return commitContentObservable;
  }

  createNewProject(projectName:string, template:string=""):Observable<any>{
    let requestUrl = this._serverUrl + "/feeds/?action=createProject";
    let createProjectObservable = this._http
      .post(requestUrl, {project_name: projectName, template: template}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
        }
      });
    return createProjectObservable;
  }

  createProjectContent(projectContent:Object, encapsulationPath:string=""):Observable<Object>{
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "/" + encapsulationPath;
    let createContentObservable = this._http
      .post(requestUrl, {content: projectContent}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          console.log("Project content created");
        }
      });

    return createContentObservable;
  }

  addNewCollaborator(emailAddress, accessLevelInt){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";
    let addNewCollaboratorObservable = this._http
      .post(requestUrl, {email: emailAddress, access_level_int: accessLevelInt}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          if(responseObject.success){
            this._resetIntervalTimer();
            console.log("New Collaborator Added");
          }
        }
      });

    return addNewCollaboratorObservable;
  }

  removeCollaborator(collaboratorId){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";
    let removeCollaboratorObservable = this._http
      .delete(requestUrl + "&collaborator_id=" + collaboratorId, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Collaborator Removed");
          }
        }
      });
      

    return removeCollaboratorObservable;
  }

  updateCollaborator(collaboratorId, accessLevelInt){
    console.log("About to updated " + collaboratorId + " to access level " + accessLevelInt);
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";
    let addNewCollaboratorObservable = this._http
      .put(requestUrl, {collaborator_id: collaboratorId, access_level_int: accessLevelInt}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Collaborator Updated");
          }
        }
      });

    return addNewCollaboratorObservable;
  }

  createAccessLevel(accessLevelInt, accessLevelName){
    console.log("About to create access level " + accessLevelInt + " with the name " + accessLevelName);
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";
    let addNewCollaboratorObservable = this._http
      .post(requestUrl, {access_level_int: accessLevelInt, access_level_name: accessLevelName}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Access Level Created");
          }
        }
      });

    return addNewCollaboratorObservable;
  }

  deleteProject(projectName){
    let requestUrl = this._serverUrl + "/admin/" + this._currentProjectId;
    let deleteProjectObservable = this._http
        .delete(requestUrl + "?projectName=" + projectName, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error deleting project")
        .do(responseObject => {
          if(responseObject.loginRequired){
            this.logout();
          } else {
            this._resetIntervalTimer();
            if(responseObject.success){
              console.log("Project deleted");
              this.leaveProject();
            } 
          }         
        });

    return deleteProjectObservable;
  }


  deleteAccessLevel(accessLevelInt){
    if(accessLevelInt > 3){
      console.log("About to delete access level " + accessLevelInt);
      let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";
      let deleteAccessLevelObservable = this._http
        .delete(requestUrl + "&access_level_int=" + accessLevelInt, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error deleting project access level")
        .do(responseObject => {
          if(responseObject.loginRequired){
            this.logout();
          } else {
            this._resetIntervalTimer();
            if(responseObject.success){
              console.log("Access Level deleted");
            }
          }
        });

      return deleteAccessLevelObservable;
    }
  }

  updateAccessLevel(accessLevelInt, accessLevelName){
    console.log("About to updated access level " + accessLevelInt + " to have the name " + accessLevelName);
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";
    let addNewCollaboratorObservable = this._http
      .put(requestUrl, {access_level_int: accessLevelInt, access_level_name: accessLevelName}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Access Level Updated Updated");
          }
        }
      });

    return addNewCollaboratorObservable;
  }

  loadProjectMediaItems(numItems:number, nextPageToken:string=null){
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=mediaItems&numFiles=" + numItems + "&nextPageToken=" + nextPageToken;
    let loadMediaItemsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
        }
      });
    return loadMediaItemsObservable;
  }

  uploadMediaItem(mediaItemFile){
    var formData:FormData = new FormData();
    formData.append("file", mediaItemFile);
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=mediaItems";
    let uploadMediaItemObservable = this._http
      .post(requestUrl, formData)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error uploading media item")
      .do(responseObject => {
        if(responseObject.loginRequired){
          this.logout();
        } else {
          this._resetIntervalTimer();
          if(responseObject.media_item_url != null){
            console.log("Media item successfully uploaded");
          }
        }
      });
    return uploadMediaItemObservable;
  }

  getCurrentUser():Object{
    return this._currentUser;
  }
  
  getCurrentProjectId():number {
    return this._currentProjectId;
  }

  getCurrentProjectContent():Object{
    var result = null;
    if(this._currentProjectContentStructureHistory.content != null){
      result = this._coPipe.transform(this._currentProjectContentStructureHistory.content)
    }
    return result;
  }

  getCurrentProjectStructure():Object{
    var result = null;
    if(this._currentProjectContentStructureHistory.structure != null){
      result = this._coPipe.transform(this._currentProjectContentStructureHistory.structure);
    }
    return result;
  }

  getCurrentProjectSettings():any{
    var result = null;
    if(this._currentProjectSettings != null){
      result = this._coPipe.transform(this._currentProjectSettings);
    }
    return result;
  }

  getCurrentProjectContentHistory():any[]{
    var result = null;
    if(this._currentProjectContentStructureHistory.content_history != null){
      result = this._currentProjectContentStructureHistory.content_history.slice();
    }
    return result;
  }

  getCurrentProjectStructureHistory():any[]{
    var result = null;
    if(this._currentProjectContentStructureHistory.structure_history != null){
      result = this._currentProjectContentStructureHistory.structure_history.slice();
    }
    return result;
  }
  
  leaveProject(){
    this._currentProjectId = null;
    this._currentProjectContentStructureHistory = null;
    this._currentProjectSettings = null;
  }
}
