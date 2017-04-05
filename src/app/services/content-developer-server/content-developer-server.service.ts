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
  // Private variable to store the URL of the server. For local testing, this would be 
  // set to "http://localhost:3000". Since this app will run within the same server 
  // as the API, the path is relative.
  private _serverUrl = "./..";

  // Private variable to store the current user, so that it can be accessed 
  // by components in the app (through get methods)
  private _currentUser;

  // Private variables to store details relating to the project the user
  // is currently viewing i.e. so that if they want to reset the content/structure
  // etc, there is no need to refresh from the server
  private _currentProjectId;
  private _currentProjectContentStructureHistory;
  private _currentProjectSettings;
  
  // Private headers object, that will contain the headers to be sent with requests
  // to the server i.e. Content-Type. This headers object will be used for all requests
  private _headers:Headers;

  // Private object to store any errors caused by form validation on the project content.
  // Creating this as an object, as an array proved to be impractical when dealing 
  // with so many potential inputs. By using an object, an error can be set for the
  // "home" content (contentErrors["home"]) and will only every be set once, even if the 
  // error occurs multiple times (whereas in an array I would need to keep checking if the 
  // error already existed) and can be deleted without the need to check if it currently exists
  // (delete contentErrors["home"]). By storing the errors as key/val pairs on this object,
  // I can also check if an error exists for an item just by passing its encapsulationPath to
  // the contentErrors object (if(contentErrors["home"] != undefined))
  private _contentErrors:any = {};

  // Private callback functions used to allow the cdService to communicate
  // back to the app component i.e. when a logout occurs, or a session is
  // about to expire
  private _notifyAppComponentOfLogout:Function;
  private _notifyAppComponentOfImpendingTimeout:Function;

  // Private variables to handle the local timing of a users session, so that 
  // they can be notified before they get logged out. Storing the interval, so that
  // it can be cleared on logout, storing the active session time, to monitor how
  // long the session has been active i.e. every request to the server will reset this
  // to 0. Storing the maximum number of seconds that the server will allow the 
  // user to remain inactive (must match with the session cookie expiry, as defined
  // in the app.js file of the Node server). Determining when to warn the user about
  // an impending logout i.e. if the maximum session time was 10 minutes, and the warning
  // was 0.8, then the user would be warned when there were 2 minutes remaining on their session.
  // Could have used the session cookie to monitor this more accuratley, but exposing this
  // as anything other than "http only" could have opened the site up to XSS attacks
  private _activeSessionInterval;
  private _activeSessionIntervalSeconds:number = 5;
  private _activeSessionTime;
  private _serverSessionMaxSeconds:number = 60 * 30; //30 Minutes
  private _warnTimeoutAt:number = 0.80; // Percentage of server session max time

  // Injecting Angular Http, to allow this service to send http requests. Injecting the custom cloneObjectPipe,
  // which creates a duplicate of any object passed to it, without leaving a reference to the original
  // object (so that when private values of the service are returned to external components, their
  // values can diverge - was becoming an issue for project content etc.). Injecting the custom keyValueArrayPipe,
  // which takes in an object and returns an array of its keys or values (depending on the arguments included)
  // so that objects can be looped through i.e. to check if there are any content errors
  constructor(private _http:Http, private _coPipe:CloneObjectPipe, private _kvaPipe:KeyValArrayPipe) {
    // Initialising the headers object, and adding a content type of "application/json" 
    // for all requests
    this._headers = new Headers();
    this._headers.append("Content-Type", "application/json");
  }

  // CALLBACK INITIALISATION METHODS ------------------------------------------------------------------------

  // Method used by the app component, to pass in a callback function that 
  // can be used to notify it of a logout occuring within the app
  setupLogoutCallback(appComponentLogoutFunction:Function):void{
    // Setting the private variable to be equal to the function passed to the methods
    // So that it can be invoked when a logout occurs
    this._notifyAppComponentOfLogout = appComponentLogoutFunction;
  }

  // Method used by the app component, to pass in a callback function that
  // can be used to notify it of an impending session timeout (or session expiry)
  setTimoutWarningCallback(appComponentTimeoutWarningFunction:Function):void{
    // Setting the private variable to be equal to the function passed to the methods
    // So that it can be invoked each time the time the activeSessionInterval() method
    // detects that a session is about to be (or has) expired
    this._notifyAppComponentOfImpendingTimeout = appComponentTimeoutWarningFunction;
  }
  

  // SERVER GET METHODS (Read) ------------------------------------------------------------------------

  // Method used by the header component, to get the login URL for redirecting the
  // user to Google. This URL needs to be generated for each login, so must be 
  // sourced from the server
  getLoginUrl():Observable<any>{
    // Building the request URL using the serverUrl
    let requestUrl = this._serverUrl + "/admin/loginUrl";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let getLoginUrlObservable = this._http
      .get(requestUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error getting login url")
      .do(responseObject=> responseObject.loginUrl);
    
    // Returning the observable for this request, so callers can subscribe to the response
    return getLoginUrlObservable;
  }
  
  loadUser():Observable<Object> {
    // Building the request URL using the serverUrl
    let requestUrl = this._serverUrl + "/admin/user";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadUserObservable = this._http
      .get(requestUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error getting users details")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          // Storing the active session interval, so that it can be cleared (on logout or expiry)
          this._activeSessionInterval = setInterval(()=>{
            // Increasing the active session time by the timer tick interval
            // i.e. every 5 seconds, add 5 seconds
            this._activeSessionTime += this._activeSessionIntervalSeconds; // Add 5 seconds
            if(this._activeSessionTime > this._serverSessionMaxSeconds) {
              // If the active session time is greater than the server max time,
              // the session has expired. Stopping the interval timer
              this._stopIntervalTimer();
              // Using a callback (passed by the app component at initialisation) to notify 
                // the app component of the timeout
              this._notifyAppComponentOfImpendingTimeout(0, true);
              console.log("Your session has expired");
            } if(this._activeSessionTime > (this._serverSessionMaxSeconds * this._warnTimeoutAt)){
                // If the active session time is greater than the specified percentage of the
                // max server time, then I start emitting warnings to the app component.
                // Determining how many minutes are remaining by finding the difference (in seconds)
                // between the max server time and active session time, and dividing it by 60
                var remainingMinutes = (this._serverSessionMaxSeconds - this._activeSessionTime) / 60;
                // Using a callback (passed by the app component at initialisation) to notify 
                // the app component of the impending timeout
                this._notifyAppComponentOfImpendingTimeout(remainingMinutes, false);
            }
          }, this._activeSessionIntervalSeconds * 1000); // Every 5000 milliseconds (5seconds)

          // Storing the user object in the response as the current user
          this._currentUser = responseObject.user
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return loadUserObservable;
  }

  // Called when a user requests to be logged out, or by directives (as well as this service)
  // when a "loginRequired" property is receieved in a response for the server
  logout(){ 
    // Stopping the interval timer (as the session will be ended) 
    this._stopIntervalTimer();  

    // Creating the logout url using the serverUrl
    let logoutUrl = this._serverUrl + "/admin/logout";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let logoutObservable = this._http
      .get(logoutUrl)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error when logging user out");

    // Subscribing to the temporary observable variable, so that once the logout
    // is complete, the app component can be notified (not allowing the app component
    // to subscribe to this observable, as this would initiate the request when the app is loading)
    logoutObservable.subscribe(
      responseObject => {
        // Using the private callback function to notify the app component that the 
        // user has logged out
        this._notifyAppComponentOfLogout();
        console.log("User logged out");
      }
    );

    // Setting the current user to null
    this._currentUser = null;
    
    // Calling leave project, just incase the user was in a project view
    // When the logout occured
    this.leaveProject();
  }  

  loadUserProjects():Observable<Object> {
    // Building the request URL using the serverUrl
    let requestUrl = this._serverUrl + "/feeds/?action=collaborators";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadUserProjectsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting users projects")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return loadUserProjectsObservable;
  }

  loadProjectContentStructureHistory(projectId:number):Observable<Object>{
    this._currentProjectId = projectId;

    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + projectId + "?include=structure,content,history";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadProjectContentAndStructureObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting project content and structure")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          this._currentProjectContentStructureHistory = responseObject;
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return loadProjectContentAndStructureObservable;
  }

  loadProjectSettings():Observable<Object>{
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?allSettings";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadProjectSettingsObservable =  this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          // Setting the current project settings equal to the response object
          this._currentProjectSettings = responseObject;
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return loadProjectSettingsObservable;
  }
  
  loadAdminSettings(){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId;

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadAdminSettingsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject != null && this._currentProjectSettings != null){
            this._currentProjectSettings.update_origins = responseObject.update_origins;
            this._currentProjectSettings.read_origins = responseObject.read_origins;
            this._currentProjectSettings.public_auth_token = responseObject.public_auth_token;
          }
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return loadAdminSettingsObservable;
  }

  loadProjectMediaItems(numItems:number, nextPageToken:string=null){
    // Building the request URL using the serverUrl, the current project id, the number of items to load
    // and the next page token (if any) i.e. to go to the "next page" of media items (if the number of
    // items requests is less than the total of items available)
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=mediaItems&numFiles=" + numItems + "&nextPageToken=" + nextPageToken;
    
    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let loadMediaItemsObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return loadMediaItemsObservable;
  }

  refreshProjectHistory():Observable<Object>{
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?include=history";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let refreshProjectHistoryObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error refreshing project history")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(this._currentProjectContentStructureHistory != null && responseObject != null){
            this._currentProjectContentStructureHistory.content_history = responseObject.content_history;
            this._currentProjectContentStructureHistory.structure_hisory = responseObject.structure_history; 
          }   
        }         
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return refreshProjectHistoryObservable;
  }

  getContentofCommit(commitHash:string, historyOf:string):Observable<any>{
    // Building the request URL using the serverUrl, the current project id, the requested
    // commit hash and the history of variable
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=previewCommit&commitHash=" + commitHash + "&historyOf=" + historyOf;
    
    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur
    let commitContentObservable = this._http
      .get(requestUrl, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error getting commit content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return commitContentObservable;
  }

  // SERVER PUT METHODS (Update) ------------------------------------------------------------------------

  updateAdminSettings(updateOrigins=null, readOrigins=null):Observable<any>{
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId;

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let updateProjectSettingsObservable =  this._http
      .put(requestUrl, {update_origins: updateOrigins, read_origins: readOrigins}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          console.log("Admin settings updated!!")
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return updateProjectSettingsObservable;
  }

  updateProjectSettings(projectName=null, maxCacheAge=null, customCss=null){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?allSettings";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let updateProjectSettingsObservable =  this._http
      .put(requestUrl, {project_name: projectName, max_cache_age: maxCacheAge, custom_css: customCss}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          console.log("Project settings updated!!");
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return updateProjectSettingsObservable;
  }

  generateNewPublicAuthToken(currentAuthToken){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/admin/settings/" + this._currentProjectId + "/publicAuthToken";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint. The current public auth
    // token is used server side, to ensure that the user intenteded to reset it
    let generateNewPublicAuthTokenObservable = this._http
      .put(requestUrl, {public_auth_token: currentAuthToken}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error))
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.success){
            this._currentProjectSettings.public_auth_token = responseObject.public_auth_token;
            console.log("New public auth token generated!!");
          }
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return generateNewPublicAuthTokenObservable;
  }

  updateProjectStructure(projectStructure:Object, commitMessage:string=null):Observable<Object>{
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId;

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let structureUpdateObservable = this._http
      .put(requestUrl, {structure: projectStructure, commit_message: commitMessage},{headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project structure")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject != null){
            this._currentProjectContentStructureHistory.structure = responseObject.structure;
          }
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return structureUpdateObservable;
  }

  updateProjectContent(projectContent:Object, commitMessage:string=null, encapsulationPath:string=""):Observable<Object>{
    // Using the keyValueArray pipe to check that the contentErrors object has 
    // no properties i.e. that they are no open errors on the content, 
    // before allowing it to be saved
    if(this._kvaPipe.transform(this._contentErrors, "values").length == 0){

      // Building the request URL using the serverUrl and the current project id
      let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "/" + encapsulationPath;

      // Sending the request to the server, using the url created above.
      // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
      let contentUpdateObservable = this._http
        .put(requestUrl, {content: projectContent, commit_message: commitMessage}, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error updating project content")
        .do(responseObject => {
            if(responseObject.loginRequired){
              // If the responseObject has returned a "loginRequired" property, then
              // the users session must have expired, become invalid or the login failed.
              // Requesting a logout so that the app can force a login
              this.logout();
            } else {
              // Resetting the timer, as the user just completed an interaction with the
              // server, which will have reset their session
              this._resetIntervalTimer();
              if(responseObject != null && this._currentProjectContentStructureHistory != null){
                this._currentProjectContentStructureHistory.content = responseObject.content;
              }
          }    
        });

      // Returning the observable for this request, so callers can subscribe to the response
      return contentUpdateObservable;
    } else {
      // Since there are errors still present on the content form validation, this request cannot be sent
      return null;
    }
    
  }

  updateCollaborator(collaboratorId, accessLevelInt){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let addNewCollaboratorObservable = this._http
      .put(requestUrl, {collaborator_id: collaboratorId, access_level_int: accessLevelInt}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Collaborator Updated");
          }
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return addNewCollaboratorObservable;
  }

  updateAccessLevel(accessLevelInt, accessLevelName){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let addNewCollaboratorObservable = this._http
      .put(requestUrl, {access_level_int: accessLevelInt, access_level_name: accessLevelName}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error updating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Access Level Updated Updated");
          }
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return addNewCollaboratorObservable;
  }

  // SERVER POST METHODS (Create) ------------------------------------------------------------------------
  createNewProject(projectName:string, template:string=""):Observable<any>{
    // Building the request URL using the serverUrl 
    let requestUrl = this._serverUrl + "/feeds/?action=createProject";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let createProjectObservable = this._http
      .post(requestUrl, {project_name: projectName, template: template}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return createProjectObservable;
  }

  createProjectContent(projectContent:Object, encapsulationPath:string=""):Observable<Object>{
    // Building the request URL using the serverUrl, the current project id and the encapsulation path (if any)
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "/" + encapsulationPath;

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let createContentObservable = this._http
      .post(requestUrl, {content: projectContent}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project content")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          console.log("Project content created");
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return createContentObservable;
  }

  addNewCollaborator(emailAddress, accessLevelInt){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let addNewCollaboratorObservable = this._http
      .post(requestUrl, {email: emailAddress, access_level_int: accessLevelInt}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          if(responseObject.success){
            // Resetting the timer, as the user just completed an interaction with the
            // server, which will have reset their session
            this._resetIntervalTimer();
            console.log("New Collaborator Added");
          }
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return addNewCollaboratorObservable;
  }

  createAccessLevel(accessLevelInt, accessLevelName){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the appropriate properties in the request body, as per
    // the server API definition for this endpoint
    let addNewCollaboratorObservable = this._http
      .post(requestUrl, {access_level_int: accessLevelInt, access_level_name: accessLevelName}, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error creating project access level")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Access Level Created");
          }
        }
      });

    // Returning the observable for this request, so callers can subscribe to the response
    return addNewCollaboratorObservable;
  }

  uploadMediaItem(mediaItemFile){
    // Creating a new FormData object, to store the reference to the file that 
    // is to be uploaded (to allow for AJAX uploading of files). Appending the 
    // media item file to the form data. This data will be sent as the request body
    var formData:FormData = new FormData();
    formData.append("file", mediaItemFile);

    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=mediaItems";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the formData object as the request body, to send the file to the server
    let uploadMediaItemObservable = this._http
      .post(requestUrl, formData)
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error) || "Unknown error uploading media item")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.media_item_url != null){
            console.log("Media item successfully uploaded");
          }
        }
      });
    
    // Returning the observable for this request, so callers can subscribe to the response
    return uploadMediaItemObservable;
  }

  // SERVER DELETE METHODS (Delete) ------------------------------------------------------------------------

  removeCollaborator(collaboratorId){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=collaborators";

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the collaborator id as a URL parameter, as this will be used server side
    // to validate that the user intended to delete this collaborator. Ideally, the collaborator
    // id should be in the request body (as with all other requests to the API), but
    // Angular HTTP delete methods don't allow for request bodys to be included, so 
    // making an exception in the API to allow the app to pass it in the URL instead
    let removeCollaboratorObservable = this._http
      .delete(requestUrl + "&collaborator_id=" + collaboratorId, {headers: this._headers})
      .map((responseObject: Response) => <any> responseObject.json())
      .catch(error => Observable.throw(error.json().error) || "Unknown error adding new collaborator to project")
      .do(responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout so that the app can force a login
          this.logout();
        } else {
          // Resetting the timer, as the user just completed an interaction with the
          // server, which will have reset their session
          this._resetIntervalTimer();
          if(responseObject.success){
            console.log("Collaborator Removed");
          }
        }
      });
      
    // Returning the observable for this request, so callers can subscribe to the response
    return removeCollaboratorObservable;
  }

  deleteProject(projectName){
    // Building the request URL using the serverUrl and the current project id
    let requestUrl = this._serverUrl + "/admin/" + this._currentProjectId;

    // Sending the request to the server, using the url created above.
    // Mapping all responses to JSON, and catching any errors that occur.
    // Including the project name as a URL parameter, as this will be used server side
    // to validate that the user intended to delete this project. Ideally, the project
    // name should be in the request body (as with all other requests to the API), but
    // Angular HTTP delete methods don't allow for request bodys to be included, so 
    // making an exception in the API to allow the app to pass it in the URL instead
    let deleteProjectObservable = this._http
        .delete(requestUrl + "?projectName=" + projectName, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error deleting project")
        .do(responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout so that the app can force a login
            this.logout();
          } else {
            // Resetting the timer, as the user just completed an interaction with the
            // server, which will have reset their session
            this._resetIntervalTimer();
            if(responseObject.success){
              console.log("Project deleted");
              this.leaveProject();
            } 
          }         
        });

    // Returning the observable for this request, so callers can subscribe to the response
    return deleteProjectObservable;
  }

  deleteAccessLevel(accessLevelInt){
    // Ensuring that the access level is greater than 3 before allowing a request to
    // delete it to be sent. Default access levels cannot be deleted, and while the server
    // will not allow this even if the request did send, preventing this from happening
    // to reduce the number of unnecessary requests
    if(accessLevelInt > 3){
      // Building the request URL using the serverUrl and the current project id
      let requestUrl = this._serverUrl + "/feeds/" + this._currentProjectId + "?action=accessLevels";

      // Sending the request to the server, using the url created above.
      // Mapping all responses to JSON, and catching any errors that occur
      let deleteAccessLevelObservable = this._http
        .delete(requestUrl + "&access_level_int=" + accessLevelInt, {headers: this._headers})
        .map((responseObject: Response) => <any> responseObject.json())
        .catch(error => Observable.throw(error.json().error) || "Unknown error deleting project access level")
        .do(responseObject => {
          if(responseObject.loginRequired){
            // If the responseObject has returned a "loginRequired" property, then
            // the users session must have expired, become invalid or the login failed.
            // Requesting a logout so that the app can force a login
            this.logout();
          } else {
            // Resetting the timer, as the user just completed an interaction with the
            // server, which will have reset their session
            this._resetIntervalTimer();
            if(responseObject.success){
              console.log("Access Level deleted");
            }
          }
        });
        
      // Returning the observable for this request, so callers can subscribe to the response
      return deleteAccessLevelObservable;
    }
  }

  // GETTER METHODS ------------------------------------------------------------------------
  getCurrentUser():Object{
    // Returning the current user object
    return this._currentUser;
  }
  
  getCurrentProjectId():number {
    // Returning the id of the current project
    return this._currentProjectId;
  }

  getCurrentProjectContent():Object{
    // Defaulting the result to null (as if the requested content is null, then it cant
    // be passed to the cloneObjectPipe)
    var result = null;
    // Checking that the container object is not null, and that there is a value present
    // for the content
    if(this._currentProjectContentStructureHistory != null && this._currentProjectContentStructureHistory.content != null){
      // Setting the request equal to a copy of the current project's content (using the
      // custom cloneObjectPipe). At times, some of the changes in the components
      // seemed to leak back into the private variable here, so by cloning the object, 
      // leaving no reference to its original remaining, I can always guarantee
      // that the project content stored in the cdService are the same as that
      // most recently loaded by the server. Allows for content to be reset, without
      // additional calls to the server
      result = this._coPipe.transform(this._currentProjectContentStructureHistory.content)
    }
    return result;
  }

  getCurrentProjectStructure():Object{
    // Defaulting the result to null (as if the requested content is null, then it cant
    // be passed to the cloneObjectPipe)
    var result = null;
    // Checking that the container object is not null, and that there is a value present
    // for the structure
    if(this._currentProjectContentStructureHistory != null && this._currentProjectContentStructureHistory.structure != null){
      // Setting the request equal to a copy of the current project's structure (using the
      // custom cloneObjectPipe). At times, some of the changes in the components
      // seemed to leak back into the private variable here, so by cloning the object, 
      // leaving no reference to its original remaining, I can always guarantee
      // that the project structure stored in the cdService are the same as that
      // most recently loaded by the server. Allows for structure to be reset, without
      // additional calls to the server
      result = this._coPipe.transform(this._currentProjectContentStructureHistory.structure);
    }
    return result;
  }

  getCurrentProjectSettings():any{
    // Defaulting the result to null (as if the requested content is null, then it cant
    // be passed to the cloneObjectPipe)
    var result = null;
    // Checking that the project settings object is not null
    if(this._currentProjectSettings != null){
      // Setting the request equal to a copy of the currentProject settings (using the
      // custom cloneObjectPipe). At times, some of the changes in the components
      // seemed to leak back into the private variable here, so by cloning the object, 
      // leaving no reference to its original remaining, I can always guarantee
      // that the project settings stored in the cdService are the same as those
      // most recently loaded by the server. Allows for settings to be reset, without
      // additional calls to the server
      result = this._coPipe.transform(this._currentProjectSettings);
    }
    return result;
  }

  getCurrentProjectContentHistory():any[]{
    // Defaulting the result to null (as if the requested content is null, then it cant
    // be sliced)
    var result = null;
    // Checking that the container object is not null, and that there is a value present
    // for the content history
    if(this._currentProjectContentStructureHistory != null && this._currentProjectContentStructureHistory.content_history != null){
      // Setting the result equal to the content history array. Calling the slice()
      // method on the array, to trick Angular into thinking that this is a completly
      // new array (as Angular doesnt seem to notice other changes in arrays as efficently,
      // and sometimes completly ignores them)
      result = this._currentProjectContentStructureHistory.content_history.slice();
    }
    return result;
  }

  getCurrentProjectStructureHistory():any[]{
    // Defaulting the result to null (as if the requested content is null, then it cant
    // be sliced)
    var result = null;
    // Checking that the container object is not null, and that there is a value present
    // for the structure history
    if(this._currentProjectContentStructureHistory != null && this._currentProjectContentStructureHistory.structure_history != null){
      // Setting the result equal to the structure history array. Calling the slice()
      // method on the array, to trick Angular into thinking that this is a completly
      // new array (as Angular doesnt seem to notice other changes in arrays as efficently,
      // and sometimes completly ignores them)
      result = this._currentProjectContentStructureHistory.structure_history.slice();
    }
    return result;
  }

  // CONTENT ERRORS ------------------------------------------------------------------------

  // Used by directives to get all content errors
  getContentErrors():any {
    // Using the cloneObjectPipe to create a copy of the content errors object, with
    // no reference to the original object
    return this._coPipe.transform(this._contentErrors);
  }

  // Used by directives to update a content error
  updateContentError(propertyName:string, value:string){
    // Updating the value of this property on the content errors object
    this._contentErrors[propertyName] = value;
  }

  // Used by directives to delete a content error
  deleteContentError(propertyName){
    // Deleting this property from the content errors object
    delete this._contentErrors[propertyName];
  }

  // RESET METHODS ------------------------------------------------------------------------

  // Called by this service, as well as the CMS component, when a user leaves the
  // view of the current project (or they become logged out - either by request 
  // or session expiry)
  leaveProject(){
    // Setting each of the project specific variables to null
    this._currentProjectId = null;
    this._currentProjectContentStructureHistory = null;
    this._currentProjectSettings = null;
  }

  // PRIVATE METHODS ------------------------------------------------------------------------

  // Used to reset the interval timer i.e. every time an response is
  // received from the server
  private _resetIntervalTimer(){
    // Resetting the active session time to 0
    this._activeSessionTime = 0;
  }

  // Used to stop the interval timer i.e. on logout, or if a session expires
  private _stopIntervalTimer(){
    // Resetting the active session timer
    this._resetIntervalTimer();  

    // Checking if there is an interval active
    if(this._activeSessionInterval != null){
      // If so, then clearing this interval i.e. stopping the timer
      clearInterval(this._activeSessionInterval);

      // Setting the interval to null, so it can't be "cleared" twice
      this._activeSessionInterval = null;
    }
  }
}
