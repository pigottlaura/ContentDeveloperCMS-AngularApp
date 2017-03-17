import { Component, Input, Output, EventEmitter } from '@angular/core';

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

  contentChanged(updatedContent=null){
    if(updatedContent != null && updatedContent.constructor.name.toLowerCase() != "event"){
      this.itemContentChanged.emit({path: this.encapsulationPath, content:updatedContent});
    } else {
      this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
    }
  }
}
