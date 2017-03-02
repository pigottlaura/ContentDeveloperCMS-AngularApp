import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomJsonPipe } from "./../../pipes/custom-json.pipe";

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [ CustomJsonPipe ]
})
export class AdminComponent implements OnInit {
  @Input() projectContent;
  @Input() projectStructure;
  @Input() projectStructurePreview;
  @Output() saveStructure:EventEmitter<Object> = new EventEmitter<Object>();
  
  constructor(private _jsPipe:CustomJsonPipe) {}

  ngOnInit() {
  }

  ngOnChanges(changes){
    if(changes.projectStructure){
      this.projectStructure = changes.projectStructure.currentValue;
      this.projectStructurePreview = this._jsPipe.transform(this.projectStructure, "stringify");
      this.formatStructureJson();
    }
  }

  formatStructureJson(){
    var tmpObj:any = this._jsPipe.transform(this.projectStructurePreview, "parse");

    if(tmpObj != null){
      this.projectStructurePreview = this._jsPipe.transform(tmpObj, "stringify");
    }
  }

  resetProjectStructure(){
    this.projectStructurePreview = this._jsPipe.transform(this.projectStructure, "stringify");
  }

  saveProjectStructure(){
    let updatedStructure = this._jsPipe.transform(this.projectStructurePreview, "parse");
    if(updatedStructure != null){
      this.saveStructure.emit(updatedStructure);
    }
  }

}
