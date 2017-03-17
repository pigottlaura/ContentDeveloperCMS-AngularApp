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
  @Input() viewOnly:boolean = false;
  @Input() topLevelCollection:Boolean = false;
  @Input() subCollection:boolean = false;
  @Input() encapsulationPath:string;
  @Output() contentChanged:EventEmitter<Object> = new EventEmitter<Object>();
  
  constructor() { }

  itemContentChanged(contentData){
    this.contentChanged.emit(contentData);
  }

  collectionContentChanged(contentData){
    console.log(contentData);
    this.contentChanged.emit(contentData);
  }

  deleteItem(encapsulationPath, index){
    if(this.projectContent[encapsulationPath] != null){
      switch(this.projectContent[encapsulationPath].constructor.name.toLowerCase()){
        case "array":{
          this.projectContent[encapsulationPath].splice(index, 1);
          this.projectContent[encapsulationPath] = this.projectContent[encapsulationPath].slice();
          this.collectionContentChanged({path: encapsulationPath, content: this.projectContent[encapsulationPath]});
          break;
        }
      }
    }
  }

  addNewItem(encapsulationPath, contentType){
    if(this.projectStructure[this.collection] != null){
      if(this.projectContent == null){
        this.projectContent = this._createNewItem(this.projectStructure);
      }
      if(this.projectContent[this.collection] == null){
        this.projectContent[this.collection] = this._createNewItem(this.projectStructure[this.collection]);
      }
      if(this.projectStructure[this.collection].items != null){
        if(this.projectStructure[this.collection].type != null && this.projectStructure[this.collection].type == "array"){
          var newItem = this._createNewItem(this.projectStructure[this.collection].items);
          this.projectContent[this.collection].push(newItem);
          this.projectContent[this.collection] = this.projectContent[this.collection].slice();
          this.collectionContentChanged({path: encapsulationPath, content: this.projectContent[this.collection]});
        }
      }
    }
  }

  private _createNewItem(itemsStructure){
    var newItem;
    if(itemsStructure.type == "array"){
      newItem = [];
    } else {
      newItem = {};
      for(var attribute in itemsStructure){
        newItem[attribute] = null;
      }
    }
    
    return newItem;
  }
}
