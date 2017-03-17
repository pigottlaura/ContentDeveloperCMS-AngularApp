import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.css']
})
export class CollectionItemComponent {
  @Input() itemName:string;
  @Input() itemStructure:Object;
  @Input() itemContent:Object;
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean = false;
  @Input() encapsulationPath:string;
  @Output() itemContentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() collectionItemRequestToViewMediaItems:EventEmitter<any> = new EventEmitter<any>();

  constructor(private _cdService:ContentDeveloperServerService){}

  contentChanged(){  
    this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
  }

  viewAvailableMediaItems(callbackFunction:Function=null){
    if(callbackFunction != null){
      this.collectionItemRequestToViewMediaItems.emit(callbackFunction);
    } else {
      this.collectionItemRequestToViewMediaItems.emit(this.encapsulationPath);
    }
  }
  
  fileInputChanged(eventPayload){
    var fileToUpload = null;
    if(eventPayload.srcElement != null){
      if(eventPayload.srcElement.files != null && eventPayload.srcElement.files.length > 0){
        fileToUpload = eventPayload.srcElement.files[0];
        eventPayload.srcElement.value = "";
      }
    } else {
      fileToUpload = eventPayload.file;
    }
    
    this._cdService.uploadMediaItem(fileToUpload).subscribe(
      responseObject => {
        if(responseObject.fileUrl != null){
          if(eventPayload.callback != null){
            eventPayload.callback(responseObject.fileUrl);
          } else {
            this.itemContent = responseObject.fileUrl;
            this.contentChanged();
          }
          
        }
      }
    );
    
  }
}
