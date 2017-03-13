import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CloneObjectPipe } from "./../../../pipes/clone-object.pipe";
import { KeyValArrayPipe } from "./../../../pipes/key-val-array.pipe";

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

  constructor(private _coPipe:CloneObjectPipe, private _kvaPipe:KeyValArrayPipe) { }

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

  itemsReordered(dragData){

    if(this.projectContent[dragData.collectionName] != null){
      var reorderedContent = {};
      var currentProjectContentKeys = [];

      if(dragData.collectionType == "array"){
        for(let index in this.projectContent[dragData.collectionName]){
          currentProjectContentKeys.push(index);
        }
        reorderedContent[dragData.collectionName] = [];
      } else {
        currentProjectContentKeys = this._kvaPipe.transform(this.projectContent[dragData.collectionName], "keys");
        reorderedContent[dragData.collectionName] = {};
      }

      if(dragData.dragDirection < 0){
        //Up
        var droppedItemFound:boolean = false;
        var draggedItemFound:boolean = false;
        for(var i=0; i< currentProjectContentKeys.length; i++){
          if(currentProjectContentKeys[i] == dragData.keys.elementDroppedOn) {
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][dragData.keys.elementDragged];
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i+1]] = this.projectContent[dragData.collectionName][dragData.keys.elementDroppedOn];
            droppedItemFound = true;
            if(currentProjectContentKeys[i+1] == dragData.keys.elementDragged){
              draggedItemFound = true;
            }
            i++;
          } else if(currentProjectContentKeys[i] == dragData.keys.elementDragged) {
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i-1]];
            draggedItemFound = true;
          } else {
            if(droppedItemFound && draggedItemFound == false){
              reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i-1]];
            } else {
              reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i]];
            }
          }    
        }
      } else if(dragData.dragDirection > 0){
        //Down COMPLETED
        var draggedItemFound:boolean = false;
        var droppedItemFound:boolean = false;
        for(var i=0; i< currentProjectContentKeys.length; i++){
          if(currentProjectContentKeys[i+1] == dragData.keys.elementDroppedOn) {
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][dragData.keys.elementDroppedOn];
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i+1]] = this.projectContent[dragData.collectionName][dragData.keys.elementDragged];
            droppedItemFound = true;
            i++;
          } else if(currentProjectContentKeys[i] == dragData.keys.elementDragged) {
            reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i+1]];
            draggedItemFound = true;
          } else {
            if(draggedItemFound && droppedItemFound == false){
              reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i+1]];
            } else {
              reorderedContent[dragData.collectionName][currentProjectContentKeys[i]] = this.projectContent[dragData.collectionName][currentProjectContentKeys[i]];
            }
          }   
        }
      }
      

      console.log(reorderedContent);
    
      this.contentChanged.emit({path: dragData.path, content:reorderedContent[dragData.collectionName]});
    }
  }
}
