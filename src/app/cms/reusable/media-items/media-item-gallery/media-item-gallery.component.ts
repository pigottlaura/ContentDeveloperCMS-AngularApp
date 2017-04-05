import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-media-item-gallery',
  templateUrl: './media-item-gallery.component.html',
  styleUrls: ['./media-item-gallery.component.css']
})
export class MediaItemGalleryComponent implements OnInit, OnChanges {
  // Inputs to allow these properties to be bound to this component
  @Input() numItemsPerPage:number;
  @Input() numItemsPerRow:number;
  @Input() visible:boolean;

  // Outputs to emit events to the parent component
  @Output() closeButtonClicked:EventEmitter<void> = new EventEmitter<void>();
  @Output() mediaItemSelected:EventEmitter<string> = new EventEmitter<string>();

  // Creating variables that will only be used within this component, to store
  // the next page token (if one is returned in the response object) and the
  // array of media items (as returned from the server)
  _mediaItemNextPageToken;
  _mediaItems;

  // Injecting the Content Developer Server service, so that this component
  // can load media items from the server
  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    // Loading the first page of media items
    this.loadMediaItems();
  }

  ngOnChanges(changes){
    if(changes.visible && this.visible){
      // If this component becomes visible, loading the media
      // items again (but not using the next page token)
      this.loadMediaItems(false);
    }
  }

  loadMediaItems(useNextPageToken=true){
    // Checking if the next page token should be included in the request or not
    var nextPageToken = useNextPageToken ? this._mediaItemNextPageToken : null;

    // Requesting the cdService to load the urls of all media items from the server
    this._cdService.loadProjectMediaItems(this.numItemsPerPage, nextPageToken).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          // If the responseObject has returned a "loginRequired" property, then
          // the users session must have expired, become invalid or the login failed.
          // Requesting a logout on the cdService, so that the app can force a login
          this._cdService.logout();
        } else {
          // Storing the next page token returned in the response (even if it is null)
          this._mediaItemNextPageToken = responseObject.next_page_token;       
          
          // Checking that media items were returned in the response
          if(responseObject.media_items != null){
            // Storing the array of media item data in this component
            this._mediaItems = responseObject.media_items;
          }
        }        
      }
    );
  }

  mediaItemClicked(mediaItemUrl){
    // Bubbling the event received from the media-item component to the parent component
    this.mediaItemSelected.emit(mediaItemUrl);
  }

  hide(){
    // Emitting the close button event to the parent
    this.closeButtonClicked.emit();
  }
}
