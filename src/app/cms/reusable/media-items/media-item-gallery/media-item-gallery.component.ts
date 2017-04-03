import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Component({
  selector: 'app-media-item-gallery',
  templateUrl: './media-item-gallery.component.html',
  styleUrls: ['./media-item-gallery.component.css']
})
export class MediaItemGalleryComponent implements OnInit, OnChanges {
  @Input() numItemsPerPage:number;
  @Input() numItemsPerRow:number;
  @Input() visible:boolean;
  @Output() closeButtonClicked:EventEmitter<void> = new EventEmitter<void>();
  @Output() mediaItemSelected:EventEmitter<string> = new EventEmitter<string>();
  private _mediaItemNextPageToken;
  private _mediaItems;

  constructor(private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    this.loadMediaItems();
  }

  ngOnChanges(changes){
    if(changes.visible && this.visible){
      this.loadMediaItems(false);
    }
  }

  loadMediaItems(useNextPageToken=true){
    var nextPageToken = useNextPageToken ? this._mediaItemNextPageToken : null;
    this._cdService.loadProjectMediaItems(this.numItemsPerPage, nextPageToken).subscribe(
      responseObject => {
        if(responseObject.loginRequired){
          this._cdService.logout();
        } else {
          this._mediaItemNextPageToken = responseObject.next_page_token;       
          
          if(responseObject.media_items != null){
            this._mediaItems = responseObject.media_items;
          }
        }        
      }
    );
  }

  mediaItemClicked(mediaItemUrl){
    this.mediaItemSelected.emit(mediaItemUrl);
  }

  hide(){
    this.closeButtonClicked.emit();
  }

}
