import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  @Input() collection:string;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  @Input() viewContent:boolean;
  @Input() topLevelCollection:Boolean = false;
  @Input() subCollection:boolean = false;
  @Input() encapsulationPath:string;
  @Output() contentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() collectionRequestToViewMediaItems:EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  itemContentChanged(contentData){
    this.contentChanged.emit(contentData);
  }

  collectionContentChanged(contentData){
    this.contentChanged.emit(contentData);
  }

  collectionItemRequestToViewMediaItems(itemEncapsulationPath){
    this.collectionRequestToViewMediaItems.emit(itemEncapsulationPath);
  }

  viewMediaItems(itemEncapsulationPath){
    this.collectionRequestToViewMediaItems.emit(itemEncapsulationPath);
  }

  itemsReordered(collectionEncapsulationPath){
    console.log(collectionEncapsulationPath + " has been reordered");
  }
}
