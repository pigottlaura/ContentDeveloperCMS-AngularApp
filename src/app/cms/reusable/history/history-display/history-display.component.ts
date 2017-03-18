import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { ShortenerPipe } from "./../../../../pipes/shortener.pipe";

@Component({
  selector: 'app-history-display',
  templateUrl: './history-display.component.html',
  styleUrls: ['./history-display.component.css']
})
export class HistoryDisplayComponent {
  @Input() history:any[];
  @Input() historyOf:string;
  @Input() showPreview:boolean = false;
  @Output() revertToCommit:EventEmitter<Object> = new EventEmitter<Object>();
  private _previewHistoryObject:Object;
  private _previewHistoryHash:string;

  constructor(private _cdService:ContentDeveloperServerService, private _sPipe:ShortenerPipe){}

  preview(historyObject){
    this._previewHistoryObject = this._cdService.getContentofCommit(historyObject.hash, this.historyOf).subscribe(
      responseObject => {
        this._previewHistoryObject = this.historyOf == 'structure' ? responseObject.commit_structure : responseObject.commit_content;
        this._previewHistoryHash = historyObject.hash;
      }
    );
  }

  revert(){
    let revertData = {
      for: this.historyOf,
      commit_message: "Project " + this.historyOf + " rolled back to commit id: " + this._sPipe.transform(this._previewHistoryHash, 6),
      object: this._previewHistoryObject
    }
    this.revertToCommit.emit(revertData);
  }
  
  clear(){
    this._previewHistoryObject = null;
    this._previewHistoryHash = null;
  }
}
