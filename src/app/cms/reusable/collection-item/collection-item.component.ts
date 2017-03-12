import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.css']
})
export class CollectionItemComponent implements OnInit {
  @Input() itemName:string;
  @Input() itemStructure:Object;
  @Input() itemContent:Object;
  @Input() viewContent:boolean;
  @Input() encapsulationPath:string;
  @Output() itemContentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() collectionItemRequestToViewMediaItems:EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  contentChanged(){  
    this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
  }

  viewAvailableMediaItems(){
    this.collectionItemRequestToViewMediaItems.emit(this.encapsulationPath);
  }

}
