import { Component, Input, Output, EventEmitter, ElementRef, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements DoCheck {
  // Inputs to allow these properties to be bound to this component
  @Input() viewContent:boolean = true;
  @Input() viewOnly:boolean = false;
  @Input() itemContent;
  @Input() itemAttributes;
  @Input() encapsulationPath:string;

  // Outputs to emit events to the parent component
  @Output() fileChanged:EventEmitter<string> = new EventEmitter<string>();

  // Creating variables that will only be used within this component
  _mediaItemGalleryVisible:boolean = false;
  _warning:string;
  _contentError:string;
  _fileInputElement:HTMLInputElement;

  // Injecting the element ref (to allow this component to get the file
  // input element contained within the containers native element). Injecting 
  // the Content Developer Server service (so this componet can upload files)
  constructor(private _el:ElementRef, private _cdService:ContentDeveloperServerService){}

  ngAfterViewInit(){
    // After the DOM is built, finding the file input element contained within this component
    this._fileInputElement = this._el.nativeElement.getElementsByClassName("fileInput")[0];
  }

  ngDoCheck(){
    if(this._fileInputElement != null){
      // Checking if this item currently has content
      if(this.itemContent != null){
        this._fileInputElement.setAttribute("data-url", this.itemContent);
        this._contentError = null;
      } else {
        this._fileInputElement.removeAttribute("data-url");
      }

      // Checking if this item currently has any errors
      if(this._fileInputElement.hasAttribute("data-error")){
          this._contentError = this._fileInputElement.getAttribute("data-error");
      } else {
        this._contentError = null;
      }
    }
  }
  openFileExplorer(){
    // Trigger a click on the file input element (as it is not visible
    // to the user - only a button is visible)
    this._fileInputElement.click();
  }

  toggleMediaItemGallery(){
    // Making the media item visible boolean equal to the opposite
    // of what it currently is
    this._mediaItemGalleryVisible = !this._mediaItemGalleryVisible;
  }

  showMediaItemGallery(){
    this._mediaItemGalleryVisible = true;
  }

  hideMediaItemGallery(){
    this._mediaItemGalleryVisible = false;
  }

  mediaItemSelected(mediaItemUrl){
    // Invoked when a media item selected event occurs (after an upload
    // or the user clicking on an image in the media item gallery)
    this.itemContent = mediaItemUrl;
    // Setting the "data-url" attribute of the file input to the
    // updated content (for form validation)
    this._fileInputElement.setAttribute("data-url", this.itemContent);
    // Emitting the file updated event, with the url of the relevant media item
    this.fileChanged.emit(mediaItemUrl);
    // Clearing any warnings or content errrs
    this._warning = this._contentError = null;    
    // Hiding the media item gallery
    this.hideMediaItemGallery();
  }

  fileInputChanged(fileInput:HTMLInputElement){
    if(fileInput.files != null && fileInput.files.length > 0){
      // Displaying a warning that this file is uploaded (will be
      // cleared once the upload is complete)
      this._warning = "Uploading...";

      // Requesting upload of the first file in the file array of the 
      // file input (i.e. the file the user just selected from their 
      // file explorer)
      this._cdService.uploadMediaItem(fileInput.files[0]).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          if(responseObject.success){
            this.mediaItemSelected(responseObject.media_item_url);
          }
        }          
      });
    }    
  }
}
