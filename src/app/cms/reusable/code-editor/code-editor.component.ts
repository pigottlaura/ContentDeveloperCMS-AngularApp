import { Component, Input, Output, EventEmitter, HostListener, DoCheck } from '@angular/core';
import { CustomJsonPipe } from "./../../../pipes/custom-json.pipe";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements DoCheck {
  @Input() codeJson:string;
  @Input() formatJson:boolean = false;
  @Output() codeUpdated:EventEmitter<Object> = new EventEmitter<Object>();
  private _textarea;
  private _cursorPosition;
  constructor(private _jsPipe:CustomJsonPipe) { }

  ngDoCheck(){
    if(this._textarea != null && this._textarea.selectionStart == this.codeJson.length){
      this._textarea.setSelectionRange(this._cursorPosition, this._cursorPosition);
    }
    if(this.formatJson){
      this._formatStructureJson();
    }   
  }

  @HostListener("keyup", ["$event"])
  onKeyUp(e){
    this._formatStructureJson(e);
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(e){
    this._textarea = e.target;
    this._cursorPosition = e.target.selectionStart;
    var deletePrevChar = false;
    var deleteSelection = false;
    var appendChar = "";
    if(e.key.toLowerCase() == "enter" || e.keyCode == 13){
        e.preventDefault();
        appendChar = "\n";
    }

    if(e.key.toLowerCase() == "backspace" || e.keyCode == 8){
      if(e.target.selectionEnd - e.target.selectionStart > 0){
        deleteSelection = true;
      } else {
        deletePrevChar = true;
      }
    }

    if(e.key.toLowerCase() == "tab" || e.keyCode == 9){
        e.preventDefault();
        if(e.shiftKey){
            deletePrevChar = true;
        } else {
            appendChar = "\t";
        }
        
    }

    this._formatStructureJson(e, appendChar, deletePrevChar, deleteSelection);
  }

  private _formatStructureJson(e=null, appendChar="", deletePrevChar=false, deleteSelection=false){
    if(e != null){
      if(deleteSelection){
        this.codeJson = this.codeJson.slice(0, this._cursorPosition) + this.codeJson.slice(e.target.selectionEnd + 1);
        this._cursorPosition = this._cursorPosition > 1 ? this._cursorPosition - 1 : this._cursorPosition;
      } else if(deletePrevChar){
          var prevChar = this.codeJson.slice(this._cursorPosition-1, this._cursorPosition);
          if(prevChar.replace(/\s/g, "").length == 0){
              this.codeJson = this.codeJson.slice(0, this._cursorPosition-1) + this.codeJson.slice(this._cursorPosition);
          }
          this._cursorPosition = this._cursorPosition > 1 ? this._cursorPosition - 1 : this._cursorPosition;      
      } else if(appendChar.length > 0) {
          this.codeJson = this.codeJson.slice(0, this._cursorPosition) + appendChar + this.codeJson.slice(e.target.selectionEnd);
          this._cursorPosition += 1;
      } else {
        this._cursorPosition += 1;
      }
    }

    var tmpObj:any = this._jsPipe.transform(this.codeJson, "parse");

    if(tmpObj != null){
      this.codeUpdated.emit(tmpObj);
      if(this.formatJson){
        this.codeJson = this._jsPipe.transform(tmpObj, "stringify");
        this.formatJson = false;
      }
    }
  }
}
