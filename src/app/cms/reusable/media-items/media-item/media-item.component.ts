import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.css']
})
export class MediaItemComponent {
  // Inputs to allow these properties to be bound to this component
  @Input() mediaItemUrl:string;
  @Input() mediaItemName:string;

  // Outputs to emit events to the parent component
  @Output() mediaItemClicked:EventEmitter<string> = new EventEmitter<string>();

  onClick(){
    // Emitting the media item clicked event, with the URL of the item that was clicked
    this.mediaItemClicked.emit(this.mediaItemUrl);
  }
}
