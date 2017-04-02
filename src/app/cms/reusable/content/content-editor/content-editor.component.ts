import { Component, OnInit, OnChanges, Input, Output, EventEmitter, DoCheck, ElementRef } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { KeyValArrayPipe } from "./../../../../pipes/key-val-array.pipe";

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit, OnChanges, DoCheck {
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
  private _contentErrors:any;
  private _commitMessage:string;
  private _contentEditorElement;

  constructor(private el:ElementRef, private _kvaPipe:KeyValArrayPipe, private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    this._contentEditorElement = this.el.nativeElement;
    this._selectFirstComponent("", false);
  }

  ngOnChanges(changes){
    if(changes.projectStructure){
      if(this.projectStructure[this.currentCollectionName] == undefined){
        this.currentCollectionName = null;
      }
    }
    if(changes.userAccessLevel){
      console.log(this.userAccessLevel);
      if(changes.userAccessLevel.currentValue != changes.userAccessLevel.previousValue){
        if(this.userAccessLevel == 3){
          this.viewOnly = true;
        } else {
          this.viewOnly = false;
        }
        var selectedCollectionName = this.currentCollectionName;
        this.currentCollectionName = null;
        setTimeout(()=> this._selectFirstComponent(selectedCollectionName), 10);
      }
    }
  }

  ngDoCheck(){
    this._updateErrors();
  }

  requestToDismissErrors(){
    this._contentErrors = null;
  }

  viewCollection(collection){
    this.currentCollectionName = collection;
  }

  projectContentChanged(contentData){
    this.updateProjectContent(this.projectContent, contentData);
  }

  saveProjectContent(){
    this._updateErrors(true);
    let contentData = {
      commit_message: this._commitMessage != null ? this._commitMessage : "Update to content of '" + this.currentCollectionName + "'"
    }
    this.requestToSaveProjectContent.emit(contentData);
    this._commitMessage = null;
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
      this.requestToDismissErrors();
    }
  }

  collectionTabsReordered(updatedTabOrder){
    this.structureCollectionTabsReordered.emit(updatedTabOrder.content);
  }
  
  private _selectFirstComponent(selectedCollectionName, click=true){
    if(click){
      if(this._contentEditorElement != null){
        var allCollectionTabs = this._contentEditorElement.getElementsByClassName("collectionTab");
        var firstVisibleCollection;

        for(var i=0; i<allCollectionTabs.length; i++){
            if(allCollectionTabs[i].getAttribute("data-key") == selectedCollectionName){
              firstVisibleCollection = allCollectionTabs[i];
            }
        }
        if(firstVisibleCollection == null && allCollectionTabs[0] != null){
          firstVisibleCollection = allCollectionTabs[0];
        }

        if(firstVisibleCollection != null){
          firstVisibleCollection.click();
        }
      }
    } else {
      if(this.currentCollectionName == null) {
        for(let collection in this.projectStructure){
          this.viewCollection(collection);
          break;
        }
      }
    }
  }

  private _updateErrors(forceView:boolean=false){
    if(this.viewContent && this.viewOnly == false && (forceView || this._contentErrors != null)){
      this._contentErrors = this._cdService.getContentErrors();
      if(this._kvaPipe.transform(this._contentErrors, "values").length == 0){
        this._contentErrors = null;
      }
    }
  }
}
