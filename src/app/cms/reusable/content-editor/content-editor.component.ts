import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit {
  @Input() viewContent:boolean;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  @Output() requestToSaveProjectContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() requestToResetProjectContent:EventEmitter<void> = new EventEmitter<void>();
  currentCollection:Object;
  currentCollectionName:string;

  constructor() { }

  ngOnInit() {
    if(this.currentCollectionName == null) {
      for(let collection in this.projectStructure){
        this.viewCollection(collection);
        break;
      }
    }
  }

  viewCollection(collection){
    this.currentCollection = collection;
    this.currentCollectionName = collection;
  }

  projectContentChanged(contentData){ 
    this.updateProjectContent(this.projectContent, contentData);
  }

  saveProjectContent(){
    this.requestToSaveProjectContent.emit();
  }

  resetProjectContent(){
    this.requestToResetProjectContent.emit();
  }

  updateProjectContent(currentContent, newContentData){
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
