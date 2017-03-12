import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../services/content-developer-server/content-developer-server.service";

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
        this._mediaItemNextPageToken = responseObject.nextPageToken;       
        
        if(responseObject.files != null){
          this._mediaItems = responseObject.files;
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
