import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { ShortenerPipe } from "./../../../../pipes/shortener.pipe";

@Component({
  selector: 'app-history-display',
  templateUrl: './history-display.component.html',
  styleUrls: ['./history-display.component.css']
})
export class HistoryDisplayComponent {
  // Inputs to allow these properties to be bound to this component
  @Input() history:any[];
  @Input() historyOf:string;
  @Input() showPreview:boolean = false;

  // Outputs to emit events to the parent component
  @Output() revertToCommit:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() previewCommit:EventEmitter<Object> = new EventEmitter<Object>();

  // Creating variables that will only be used within this component,
  // to store the content of a specific commit, as well as its commit hash
  _previewHistoryObject:Object;
  _previewHistoryHash:string;

  // Injecting the Content Developer Server service so that this component can
  // load project data from the server (based on a specific commit). Injecting
  // the custom shortener pipe, so that the commit hash can be shortened to
  // a six digit representation temporarily
  constructor(private _cdService:ContentDeveloperServerService, private _sPipe:ShortenerPipe){}

  preview(historyObject){
    // Requesting the content of the project content or data (defined by the historyOf
    // variable) as it was at the specified commit hash
    this._cdService.getContentofCommit(historyObject.hash, this.historyOf).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject != null){
            if(this.showPreview){
              // If the request was to show the preview i.e. for admins, then
              // storing the commit data within this component (to be displayed).Determining
              // which property to access on the history object, based on which
              // history the user requested i.e. structure or content
              this._previewHistoryObject = this.historyOf == 'structure' ? responseObject.commit_structure : responseObject.commit_content;
              this._previewHistoryHash = historyObject.hash;
            } else {
              // Since this preview wont be displayed within this component, emitting
              // the data relating to it in an event payload. Determining
              // which property to access on the event object, based on which
              // history the user requested i.e. structure or content
              var previewData = {
                data: this.historyOf == 'structure' ? responseObject.commit_structure : responseObject.commit_content,
                hash: historyObject.hash
              };
              this.previewCommit.emit(previewData);
            }
          }
        }        
      }
    );
  }

  revert(){
    // Creating an object to use as the event payload. Transforming
    // the preview hash to a shortened six character representation
    let revertData = {
      for: this.historyOf,
      commit_message: "Project " + this.historyOf + " rolled back to commit id: " + this._sPipe.transform(this._previewHistoryHash, 6),
      object: this._previewHistoryObject
    }
    // Emitting the revert event, with the data of this commit included
    this.revertToCommit.emit(revertData);
    // Clearning the locally stored data
    this.clear();
  }
  
  clear(){
    // Clearing the locally stored data
    this._previewHistoryObject = null;
    this._previewHistoryHash = null;
  }
}
