import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Input() viewContent:boolean = true;
  @Input() viewOnly:boolean = false;
  @Input() itemContent;
  @Input() itemAttributes;
  @Output() fileChanged:EventEmitter<string> = new EventEmitter<string>();
  private _mediaItemGalleryVisible:boolean = false;
  private _warning:string;

  constructor(private _cdService:ContentDeveloperServerService){}
  
  showMediaItemGallery(){
    this._mediaItemGalleryVisible = true;
  }

  hideMediaItemGallery(){
    this._mediaItemGalleryVisible = false;
  }

  mediaItemSelected(mediaItemUrl){
    this.itemContent = mediaItemUrl;
    this.fileChanged.emit(mediaItemUrl);
    this.hideMediaItemGallery();
  }

  fileInputChanged(fileInput:HTMLInputElement){
    if(fileInput.files != null && fileInput.files.length > 0){
        this._warning = "Uploading..."
        this._cdService.uploadMediaItem(fileInput.files[0]).subscribe(
        responseObject => {
          if(responseObject.fileUrl != null){
            this.itemContent = responseObject.fileUrl;
            this.fileChanged.emit(responseObject.fileUrl); 
            this._warning = null;       
          }
        }
      );
    }    
  }

}
