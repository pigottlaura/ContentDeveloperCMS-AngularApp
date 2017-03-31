import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CustomJsonPipe } from "./../../../pipes/custom-json.pipe";
@Component({
  selector: 'app-structure-view',
  templateUrl: './structure-view.component.html',
  styleUrls: ['./structure-view.component.css']
})
export class StructureViewComponent implements OnChanges {
  @Input() projectStructure;
  @Output() viewRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewRequestToResetStructure:EventEmitter<void> = new EventEmitter<void>();
  projectStructureJson;
  
  constructor(private _jsPipe:CustomJsonPipe) {}

  ngOnChanges(changes){
    if(changes.projectStructure){
      this.projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");
      if(this.projectStructureJson != null){
        this.projectStructureJson = this.projectStructureJson.split();
      }
    }
  }

  codeUpdated(updatedProjectStructure){
    this.projectStructure = updatedProjectStructure;
  }

  resetProjectStructure(){
    this.viewRequestToResetStructure.emit();
  }

  saveProjectStructure(commitMessage){
    if(this.projectStructure != null){
      var structureData = {
        structure: this.projectStructure,
        commit_message: commitMessage != null ? commitMessage : "Update to entire structure of project"
      }
      this.viewRequestToSaveStructure.emit(structureData);
    }
  }

  structureCollectionTabsReordered(reorderedProjectStructure){
    this.projectStructure = reorderedProjectStructure;
    this.projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");
  }
}
