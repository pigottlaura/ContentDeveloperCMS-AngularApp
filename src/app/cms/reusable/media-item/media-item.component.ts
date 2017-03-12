import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.css']
})
export class MediaItemComponent {
  @Input() mediaItemUrl:string;
  @Input() mediaItemName:string;
  @Output() mediaItemClicked:EventEmitter<string> = new EventEmitter<string>();

  onClick(){
    this.mediaItemClicked.emit(this.mediaItemUrl);
  }
}
