import { Component, OnInit, OnChanges, Input, Output, EventEmitter, DoCheck, ElementRef } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { KeyValArrayPipe } from "./../../../../pipes/key-val-array.pipe";

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit, OnChanges, DoCheck {
  // Inputs to allow these properties to be bound to this component
  @Input() viewOnly:boolean=false;
  @Input() viewContent:boolean=true;
  @Input() userAccessLevel:number;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;

  // Outputs to emit events to the parent component (most of which will bubble
  // up to the cms component)
  @Output() requestToSaveProjectContent:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() requestToResetProjectContent:EventEmitter<void> = new EventEmitter<void>();
  @Output() structureCollectionTabsReordered:EventEmitter<Object> = new EventEmitter<Object>();
  
  // Creating variables that will be passed to sub components
  currentCollectionName:string;
  contentErrors:any;

  // Creating variables that will only be used within this component
  _encapsulationPathForCurrentFileInput:string;
  _commitMessage:string;
  _contentEditorElement;

  // Injecting the element ref, so that the content editor container element
  // can be loaded from the DOM. Loading the key value array pipe, so that
  // the values from the cdService content error can be accessed. Injecting
  // the Content Developer Server service, so that the content errors from 
  // form validation can be loaded from it
  constructor(private el:ElementRef, private _kvaPipe:KeyValArrayPipe, private _cdService:ContentDeveloperServerService) { }

  ngOnInit() {
    // Storing the native element of this components container
    this._contentEditorElement = this.el.nativeElement;
    // Selecting the first component automatically (with no collection
    // selected, and no click event required)
    this._selectFirstComponent("", false);
  }

  ngOnChanges(changes){
    if(changes.projectStructure){
      // Checking that the current collection still exists on the project structure
      if(this.projectStructure[this.currentCollectionName] == undefined){
        // If it doesnt, setting the current collection to null
        this.currentCollectionName = null;
      }
    }
    if(changes.userAccessLevel){
      // Checking that the access level value has actually changed
      if(changes.userAccessLevel.currentValue != changes.userAccessLevel.previousValue){
        if(this.userAccessLevel == 3){
          // If the users access level is 3, then view only is always true
          this.viewOnly = true;
        } else {
          // Otherwise it is false
          this.viewOnly = false;
        }
        // Storing the current collection name, so that it will be stored
        // in the closure of the timeout function (to check if it still exists
        // once the users view changed)
        var selectedCollectionName = this.currentCollectionName;

        // Clearing the current collection name
        this.currentCollectionName = null;

        // Setting a timeout, so that 10 milliseconds after the view changes,
        // an attempt will be made to select the collection that was most
        // recently selected. Setting a timeout of 0 also works, as it is just
        // pushing it to the end of the stack, but allowing 10 milliseconds 
        // just to be sure the view has fully updated
        setTimeout(()=> this._selectFirstComponent(selectedCollectionName), 10);
      }
    }
  }

  ngDoCheck(){
    // Checking for validation errors
    this._updateErrors();
  }

  requestToDismissErrors(){
    // Clearing the current content validation errors
    this.contentErrors = null;
  }

  viewCollection(collection){
    // Changing to view the selected collection
    this.currentCollectionName = collection;
  }

  projectContentChanged(contentData){
    // Updating the project content, after a collection emits this event
    this.updateProjectContent(this.projectContent, contentData);
  }

  saveProjectContent(){
    // Checking for validation errors, and forcing them to be displayed
    this._updateErrors(true);
    // Creating a content data object, to emit in the save event (only
    // including the commit message, as the content will have already
    // updated in the cms component through ngModel bindings and events).
    // If no commit message exists, assuming the user is updating the current
    // collection
    let contentData = {
      commit_message: this._commitMessage != null ? this._commitMessage : "Update to content of '" + this.currentCollectionName + "'"
    }

    // Emitting the request to save content (which will bubble up to the
    // cms component)
    this.requestToSaveProjectContent.emit(contentData);
    // Clearing the commit message, so the user can enter a new one for the next commit
    this._commitMessage = null;
  }

  resetProjectContent(){
    // Emitting the reset content event (which will bubble up to the cms component)
    this.requestToResetProjectContent.emit();
  }

  updateProjectContent(currentContent, newContentData){
    // Checking that the content is being viewed, and it is not view only
    if(this.viewContent && this.viewOnly == false){
      // Getting the encapsulation keys of this content, by splitting
      // its encapsulation path at every "/" i.e. "home/contact_details"
      // will become ["home", "contact_details"]
      var encapsulationKeys = newContentData.path.split("/");

      // Looping through all of the contents encapsulation keys
      for(var i=0; i<encapsulationKeys.length - 1; i++){
        // Checking that the content has a value for this property
        if(currentContent[encapsulationKeys[i]] == null){
          if(isNaN(encapsulationKeys[i + 1])){
            // If the key is not a number, and the content has no value for it,
            // then defaulting to to an array
            currentContent[encapsulationKeys[i]] = {};
          } else {
            // Checking if current content is empty, or is an array
            if(currentContent == null || currentContent.constructor.name.toLowerCase() != "array"){
              // Setting it to an empty array
              currentContent[encapsulationKeys[i]] = [];            
            }
          }
        }
        // Adding the current content to next level of the encapsulation
        // i.e. so I can move down through all of the objects/arrays that
        // contain the end item (to make sure they all exist, and if not,
        // then create them)
        currentContent = currentContent[encapsulationKeys[i]];
      }
      // Since the content is now down as far as the property that needs to
      // be updated, setting the final key in the encapsulation path to 
      // be a property on the last level of the encapsulation
      currentContent[encapsulationKeys[encapsulationKeys.length - 1]] = newContentData.content;
      // Dismissing any content errors
      this.requestToDismissErrors();
    }
  }

  collectionTabsReordered(updatedTabOrder){
    // Triggered by a drag event. Emitting the reordered event
    this.structureCollectionTabsReordered.emit(updatedTabOrder.content);
  }
  
  private _selectFirstComponent(selectedCollectionName, click=true){
    if(click){
      // Checking that the container element has been loaded
      if(this._contentEditorElement != null){
        // Getting all visible collection tabs, based on the ones that 
        // have been rendered to the DOM (some tabs may have been hidden
        // based on the access level view)
        var allCollectionTabs = this._contentEditorElement.getElementsByClassName("collectionTab");

        // Creating an empty variable, to store the first visible collection
        var firstVisibleCollection;

        // Looping through all the visible collection tabs, to see
        // if the most recently selected collection is still visible
        for(var i=0; i<allCollectionTabs.length; i++){
            // Getting the key of this tab, and checking if it is equal to
            // the name of the last selected collection
            if(allCollectionTabs[i].getAttribute("data-key") == selectedCollectionName){
              // Since the most recently selected collection still exists, 
              // I will be selecting this by default
              firstVisibleCollection = allCollectionTabs[i];
            }
        }

        // If the most recently selected collection is no longer visible,
        // and the array of visible collections contains at least one
        // value, then selecting the first visible collection
        if(firstVisibleCollection == null && allCollectionTabs[0] != null){
          firstVisibleCollection = allCollectionTabs[0];
        }

        if(firstVisibleCollection != null){
          // Triggering a click event on the first visible (or most recently
          // selected) collection - forces a refresh of the content view
          firstVisibleCollection.click();
        }
      }
    } else {
      // If there is a current collection name available (i.e. the most recently viewed)
      if(this.currentCollectionName == null) {
        // Looping through the project structure object, just to get the first property
        // i.e. the first collection
        for(let collection in this.projectStructure){
          // Viewing the first collection
          this.viewCollection(collection);
          // Breaking the loop, as I only need the first collection
          break;
        }
      }
    }
  }

  private _updateErrors(forceView:boolean=false){
    // Checking that the content is being viewed, and that it is not
    // view only. If these two requirements are met, then only showing
    // the errors if I am forcing the view or if the errors are currently null
    if(this.viewContent && this.viewOnly == false && (forceView || this.contentErrors != null)){
      // Getting the content validation errors from the cdService
      this.contentErrors = this._cdService.getContentErrors();

      // Using the key value array pipe to get an array of the
      // values from the errors object, and checking that they is at
      // least one
      if(this._kvaPipe.transform(this.contentErrors, "values").length == 0){
        // Since the errors object contains no errors, resetting the errors to null
        this.contentErrors = null;
      }
    }
  }
}
