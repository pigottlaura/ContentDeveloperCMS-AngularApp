import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit, OnChanges {
  @Input() viewOnly:boolean=false;
  @Input() viewContent:boolean=true;
  @Input() userAccessLevel:number;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  @Output() requestToSaveProjectContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() requestToResetProjectContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() structureCollectionTabsReordered:EventEmitter<Object> = new EventEmitter<Object>();
  
  currentCollectionName:string;
  private _encapsulationPathForCurrentFileInput:string;

  ngOnInit() {
    this._selectFirstComponent();
  }

  ngOnChanges(changes){
    if(changes.projectStructure){
      if(this.projectStructure[this.currentCollectionName] == undefined){
        this.currentCollectionName = null;
        this._selectFirstComponent();
      }
    }
  }

  viewCollection(collection){
    this.currentCollectionName = collection;
  }

  projectContentChanged(contentData){
    this.updateProjectContent(this.projectContent, contentData);
  }

  saveProjectContent(){
    let contentData = {
      commit_message: "Update to content of '" + this.currentCollectionName + "'"
    }
    this.requestToSaveProjectContent.emit(contentData);
  }

  resetProjectContent(){
    this.requestToResetProjectContent.emit();
  }

  updateProjectContent(currentContent, newContentData){
    if(this.viewContent && this.viewOnly == false){
      var encapsulationKeys = newContentData.path.split("/");
      for(var i=0; i<encapsulationKeys.length - 1; i++){
        if(currentContent[encapsulationKeys[i]] == null){
          if(isNaN(encapsulationKeys[i + 1])){
            currentContent[encapsulationKeys[i]] = {};
          } else {
            if(currentContent == null || currentContent.constructor.name.toLowerCase() != "array"){
              currentContent[encapsulationKeys[i]] = [];            
            }
          }
        }
        currentContent = currentContent[encapsulationKeys[i]];
      }
      currentContent[encapsulationKeys[encapsulationKeys.length - 1]] = newContentData.content;
    }
  }

  collectionTabsReordered(updatedTabOrder){
    this.structureCollectionTabsReordered.emit(updatedTabOrder.content);
  }
  
  private _selectFirstComponent(){
    if(this.currentCollectionName == null) {
      for(let collection in this.projectStructure){
        this.viewCollection(collection);
        break;
      }
    }
  }
}