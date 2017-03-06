import { Component, OnInit, Input, Output, EventEmitter, DoCheck, OnChanges } from '@angular/core';
import { CustomJsonPipe } from "./../../pipes/custom-json.pipe";

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [ CustomJsonPipe ]
})
export class AdminComponent implements OnInit, OnChanges, DoCheck {
  @Input() projectContent;
  @Input() projectStructure;
  @Input() projectStructureJson;
  @Output() saveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() saveContent:EventEmitter<void> = new EventEmitter<void>();
  
  constructor(private _jsPipe:CustomJsonPipe) {}

  ngOnInit() {
  }

  ngOnChanges(changes){
    if(changes.projectStructure){
      this.projectStructureJson = this._jsPipe.transform(this.projectStructure, "stringify");
    }
  }

  ngDoCheck(){
    this.formatStructureJson();
  }

  formatStructureJson(){
    var tmpObj:any = this._jsPipe.transform(this.projectStructureJson, "parse");

    if(tmpObj != null){
      this.projectStructure = tmpObj;
      this.projectStructureJson = this._jsPipe.transform(tmpObj, "stringify");
    }
  }

  resetProjectStructure(){
    
  }

  saveProjectStructure(){
    let updatedStructure = this._jsPipe.transform(this.projectStructureJson, "parse");
    if(updatedStructure != null){
      this.saveStructure.emit(updatedStructure);
    }
  }

  saveProjectContent(){
    this.saveContent.emit();
  }
}
