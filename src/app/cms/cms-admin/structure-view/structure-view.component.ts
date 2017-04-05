import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CustomJsonPipe } from "./../../../pipes/custom-json.pipe";
@Component({
  selector: 'app-structure-view',
  templateUrl: './structure-view.component.html',
  styleUrls: ['./structure-view.component.css']
})
export class StructureViewComponent implements OnChanges {
  // Input to allow the project structure to be bound to this component
  @Input() projectStructure;

  // Outputs to emit events to the admin component, which will bubble up to
  // the cms component (through subsequent event emitters in the cms component)
  @Output() viewRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewRequestToResetStructure:EventEmitter<void> = new EventEmitter<void>();

  // JSON representation of the project structure, which is bound to the code editor
  projectStructureJson;
  
  constructor(private _jsPipe:CustomJsonPipe) {}

  ngOnChanges(changes){
    // Checking if the bound value of the project structure has been changed 
    // by the parent (admin) component, i.e. following a reset or saving of the structure
    if(changes.projectStructure){
      // Stringifying the structure to be stored in the json string
      this.projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");

      // Ensuring the JSON has been compiled successfully i.e. if the structure is 
      // invalid, the JSON wont generate
      if(this.projectStructureJson != null){
        // Splitting the JSON string, to trick Angular into thinking this is a new string,
        // as otherwise it ignores the change in value (the string will be joined again
        // within the code editor)
        this.projectStructureJson = this.projectStructureJson.split();
      }
    }
  }

  codeUpdated(updatedProjectStructure){
    // Invoked each time a user edits the structure in the code editor (character by character).
    // Storing the updated structure in the project structure, so it will be reflected across views
    this.projectStructure = updatedProjectStructure;
  }

  resetProjectStructure(){
    // Emitting the reset structure event, to get the admin component to bubble up to
    // the cms component to reset the structure
    this.viewRequestToResetStructure.emit();
  }

  saveProjectStructure(commitMessage){
    // Checking that a projectStructre exists
    if(this.projectStructure != null){
      // Creating an object that will be sent as the event payload of the 
      // output event (including the current project structure, and any commit
      // message that was passed to the function)
      var structureData = {
        structure: this.projectStructure,
        commit_message: commitMessage != null ? commitMessage : null
      }

      // Emitting the event, with the structure data as the payload
      this.viewRequestToSaveStructure.emit(structureData);
    }
  }

  structureCollectionTabsReordered(reorderedProjectStructure){
    // Invoked following a drag/drop event on the collection item tabs.
    // Updating the project structure, to the reordered structure
    this.projectStructure = reorderedProjectStructure;
    // Stringifying the new structure value to be stored in the project
    // structure json, so that the structure in the code editor will also update
    this.projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");
  }
}
