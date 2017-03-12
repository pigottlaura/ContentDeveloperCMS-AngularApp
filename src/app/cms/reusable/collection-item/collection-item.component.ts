import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../services/content-developer-server/content-developer-server.service";

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
  @Input() encapsulationPath:string;
  @Output() itemContentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() collectionItemRequestToViewMediaItems:EventEmitter<string> = new EventEmitter<string>();

  constructor(private _cdService:ContentDeveloperServerService){}

  contentChanged(){  
    this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
  }

  viewAvailableMediaItems(){
    this.collectionItemRequestToViewMediaItems.emit(this.encapsulationPath);
  }
  
  fileInputChanged(event){
    if(event.srcElement.files != null && event.srcElement.files.length > 0){
      this._cdService.uploadMediaItem(event.srcElement.files[0]).subscribe(
        responseObject => {
          if(responseObject.fileUrl != null){
            event.srcElement.value = "";
            this.itemContent = responseObject.fileUrl;
            this.contentChanged();
          }
        }
      );
    }
    
  }
}
