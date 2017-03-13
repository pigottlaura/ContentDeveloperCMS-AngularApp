import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent {
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

  itemContentChanged(contentData){
    this.contentChanged.emit(contentData);
  }

  collectionContentChanged(contentData){
    console.log(contentData);
    this.contentChanged.emit(contentData);
  }

  collectionItemRequestToViewMediaItems(itemEncapsulationPath){
    this.collectionRequestToViewMediaItems.emit(itemEncapsulationPath);
  }

  viewMediaItems(itemEncapsulationPath){
    this.collectionRequestToViewMediaItems.emit(itemEncapsulationPath);
  }

  deleteItem(encapsulationPath, index){
    if(this.projectContent[encapsulationPath] != null){
      switch(this.projectContent[encapsulationPath].constructor.name.toLowerCase()){
        case "array":{
          this.projectContent[encapsulationPath].splice(index, 1);
          break;
        }
      }
    }
  }

  addNewItem(encapsulationPath, contentType){
    if(this.projectContent[encapsulationPath] != null){
      if(this.projectStructure[encapsulationPath] != null){
        if(this.projectStructure[encapsulationPath].items != null){
          if(this.projectStructure[encapsulationPath].type != null && this.projectStructure[encapsulationPath].type == "array"){
            var newItem = this._createNewItem(this.projectStructure[encapsulationPath].items);
            this.projectContent[encapsulationPath].push(newItem);
            this.collectionContentChanged({path: encapsulationPath, content: this.projectContent[encapsulationPath]});
          }
        }
      }
    }
  }

  private _createNewItem(itemsStructure){
    var newItem = {};
    for(var attribute in itemsStructure){
      newItem[attribute] = null;
    }
    return newItem;
  }
}
