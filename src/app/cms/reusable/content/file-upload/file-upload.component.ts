import { Component, Input, Output, EventEmitter, ElementRef, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements DoCheck {
  @Input() viewContent:boolean = true;
  @Input() viewOnly:boolean = false;
  @Input() itemContent;
  @Input() itemAttributes;
  @Input() encapsulationPath:string;
  @Output() fileChanged:EventEmitter<string> = new EventEmitter<string>();
  private _mediaItemGalleryVisible:boolean = false;
  private _warning:string;
  private _contentError:string;
  private _fileInputElement:HTMLInputElement;

  constructor(private _el:ElementRef, private _cdService:ContentDeveloperServerService){}

  ngAfterViewInit(){
    this._fileInputElement = this._el.nativeElement.getElementsByClassName("fileInput")[0];
  }

  ngDoCheck(){
    if(this._fileInputElement != null){
      if(this.itemContent != null){
        this._fileInputElement.setAttribute("data-url", this.itemContent);
        this._contentError = null;
      } else {
        this._fileInputElement.removeAttribute("data-url");
      }

      if(this._fileInputElement.hasAttribute("data-error")){
          this._contentError = this._fileInputElement.getAttribute("data-error");
      } else {
        this._contentError = null;
      }
    }
  }
  openFileExplorer(){
    this._fileInputElement.click();
  }
  
  showMediaItemGallery(){
    this._mediaItemGalleryVisible = true;
  }

  toggleMediaItemGallery(){
    this._mediaItemGalleryVisible = !this._mediaItemGalleryVisible;
  }

  hideMediaItemGallery(){
    this._mediaItemGalleryVisible = false;
  }

  mediaItemSelected(mediaItemUrl){
    this._fileInputElement.setAttribute("data-url", this.itemContent);
    this._warning = this._contentError = null; 
    this.itemContent = mediaItemUrl;
    this.fileChanged.emit(mediaItemUrl);
    this.hideMediaItemGallery();
  }

  fileInputChanged(fileInput:HTMLInputElement){
    if(fileInput.files != null && fileInput.files.length > 0){
        this._warning = "Uploading..."
        this._cdService.uploadMediaItem(fileInput.files[0]).subscribe(
        responseObject => {
          if(responseObject.media_item_url != null){
            this.itemContent = responseObject.media_item_url;
            this.fileChanged.emit(responseObject.media_item_url); 
            this._fileInputElement.setAttribute("data-url", this.itemContent);
            this._warning = this._contentError = null;    
            this.hideMediaItemGallery();
          }
        }
      );
    }    
  }

}
