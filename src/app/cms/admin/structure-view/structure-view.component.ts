import { Component, Input, Output, EventEmitter, OnChanges, DoCheck } from '@angular/core';
import { CustomJsonPipe } from "./../../../pipes/custom-json.pipe";
@Component({
  selector: 'app-structure-view',
  templateUrl: './structure-view.component.html',
  styleUrls: ['./structure-view.component.css']
})
export class StructureViewComponent implements OnChanges, DoCheck {
  @Input() projectStructure;
  @Output() viewRequestToSaveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() viewRequestToResetStructure:EventEmitter<void> = new EventEmitter<void>();
  private _projectStructureJson;
  
  constructor(private _jsPipe:CustomJsonPipe) {}

  ngOnChanges(changes){
    if(changes.projectStructure){
      this._projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");
    }
  }

  ngDoCheck(){
    this.formatStructureJson();
  }

  formatStructureJson(){
    var tmpObj:any = this._jsPipe.transform(this._projectStructureJson, "parse");

    if(tmpObj != null){
      this.projectStructure = tmpObj;
      this._projectStructureJson = this._jsPipe.transform(tmpObj, "stringify");
    }
  }

  resetProjectStructure(){
    this.viewRequestToResetStructure.emit();
  }

  saveProjectStructure(){
    this.projectStructure = this._jsPipe.transform(this._projectStructureJson, "parse");
    if(this.projectStructure != null){
      var structureData = {
        structure: this.projectStructure
      }
      this.viewRequestToSaveStructure.emit(structureData);
    }
  }
}
