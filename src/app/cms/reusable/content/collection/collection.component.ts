import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent {
  // Inputs to allow these properties to be bound to this component
  @Input() collection:string;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean = false;
  @Input() userAccessLevel:number;
  @Input() topLevelCollection:Boolean = false;
  @Input() subCollection:boolean = false;
  @Input() encapsulationPath:string;

  // Outputs to emit events to the parent component
  @Output() contentChanged:EventEmitter<Object> = new EventEmitter<Object>();

  itemContentChanged(contentData){
    // Catching the content changed event emitted by collection-items (as the collection
    // will contain these)
    this.contentChanged.emit(contentData);
  }

  collectionContentChanged(contentData){
    // Catching the content changed event emitted by this component (as collections
    // can contain themselves). This will allow collections to bubble up these
    // events through multiple encapsulations of themselves i.e.
    // <app-collection><app-collection></app-collection></app-collection>
    this.contentChanged.emit(contentData);
  }

  deleteItem(encapsulationPath, index){
    // Checking that the content is being viewed
    if(this.viewContent){
      // Checking that this collection exists on the project content
      if(this.projectContent[this.collection] != null){
        // Checking that the constructor the this content is an array
        switch(this.projectContent[this.collection].constructor.name.toLowerCase()){
          case "array":{
            // Removing this index from the array
            this.projectContent[this.collection].splice(index, 1);
            // Setting the array equal to itself (but sliced) which tricks Angular
            // into thinking that this is a new array (as Angular will ignore
            // the change to the array otherwise)
            this.projectContent[this.collection] = this.projectContent[this.collection].slice();
            // Emitting the content changed event
            this.collectionContentChanged({path: encapsulationPath, content: this.projectContent[this.collection]});
            break;
          }
        }
      }
    }
  }

  addNewItem(encapsulationPath, contentType){
    // Checking that the content is being viewed
    if(this.viewContent){
      // Checking that this collection exists on the project structure
      if(this.projectStructure[this.collection] != null){
        // Checking that the content is not null
        if(this.projectContent == null){
          // Since the content is currently null, creating it using 
          // the project structure required
          this.projectContent = this._createNewItem(this.projectStructure);
        }

        // Checking that the requested collection exists on the content
        if(this.projectContent[this.collection] == null){
          // Since the collection does not exist on the content, creating
          // it using the project structure required
          this.projectContent[this.collection] = this._createNewItem(this.projectStructure[this.collection]);
        }

        // Checking that the structure for this collection allows for items
        // to be contained within it
        if(this.projectStructure[this.collection].items != null){
          // Checking that this collections structure is meant to be an array
          if(this.projectStructure[this.collection].type != null && this.projectStructure[this.collection].type == "array"){
            // Crearing a new empty item, with the right structure of items in this array
            var newItem = this._createNewItem(this.projectStructure[this.collection].items);
            // Adding this new item to the project content (so that a new empty item
            // with the right inputs will be displayed for the user to add to)
            this.projectContent[this.collection].push(newItem);
            // Setting the array equal to itself (but sliced) which tricks Angular
            // into thinking that this is a new array (as Angular will ignore
            // the change to the array otherwise)
            this.projectContent[this.collection] = this.projectContent[this.collection].slice();
            // Emitting the content changed event
            this.collectionContentChanged({path: encapsulationPath, content: this.projectContent[this.collection]});
          }
        }
      }
    }
  }

  private _createNewItem(itemsStructure){
    // Creating a variable to store the new item
    var newItem;
    if(itemsStructure.type == "array"){
      // If the structure type is an array, setting it to an empty array
      newItem = [];
    } else {
      // If the structure type is an object, setting it to a new object
      newItem = {};

      // Looping through all attributes required for this structure type
      for(var attribute in itemsStructure){
        // Adding these attributes as properties on the new item,
        // with no value attached to them
        newItem[attribute] = null;
      }
    }
    // Returning the new item to the caller
    return newItem;
  }
}
