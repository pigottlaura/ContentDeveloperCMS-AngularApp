import { Component, Input, Output, EventEmitter, HostListener, DoCheck } from '@angular/core';
import { CustomJsonPipe } from "./../../../pipes/custom-json.pipe";

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements DoCheck {
  // Inputs to allow the code json to be bound to this component
  @Input() codeJson:any;

  // Outputs to emit events to the parent component (most of which will bubble
  // up to the cms component)
  @Output() codeUpdated:EventEmitter<Object> = new EventEmitter<Object>();
  @Output() requestToResetProjectStructure:EventEmitter<void> = new EventEmitter<void>();
  @Output() requestToSaveProjectStructure:EventEmitter<string> = new EventEmitter<string>();

  // Variables used only within this component
  _textarea:HTMLTextAreaElement;
  _cursorPosition:number;
  _formatJson:boolean = false;
  _commitMessage:string;

  // Injecting the custom json pipe, to allow for stringifying and parsing of objects/json
  constructor(private _jsPipe:CustomJsonPipe) { }

  ngDoCheck(){
    // Checking if the cursor position is at the end of the code i.e. if the
    // code has just been formatted, or reset, the cursor will jump to the end
    if(this._textarea != null && this._textarea.selectionStart == this.codeJson.length){
      // Resetting the cursor position to the last known point of the cursor,
      // so that the user can continue typing
      this._textarea.setSelectionRange(this._cursorPosition, this._cursorPosition);
    }

    // Checking if the code json is currently an array i.e. it has just been
    // passed to the code editor by the parent component (due to initialising, or
    // resetting the code) and is currently split into an array (to force
    // Angular to recognise it as a "new" value and update the textarea)
    if(this.codeJson != null && this.codeJson instanceof Array){
      // Joining the array back to a string
      this.codeJson = this.codeJson.join();
    }
  }

  formatJsonClicked(){
    // Setting formatJson to be true before calling the update structure
    // json method, so that formatting will also be applied (not formatting
    // by default, as it would result in the code "jumping" into a neat structure
    // every time the user types
    this._formatJson = true;
    this._updateStructureJson();
  }
  
  resetProjectStructureClicked(){
    // Emitting the request to update the project structure, which will
    // bubble up through the containing components to reach the cms 
    // component so it can deal with it
    this.requestToResetProjectStructure.emit();
  }
  
  saveProjectStructureClicked(){
    // Emitting the save project event, so that the cms component can deal
    // with updating the project structure
    this.requestToSaveProjectStructure.emit(this._commitMessage);

    // Clearing the commit message locally, so that the user can enter a new
    // one for the next commit
    this._commitMessage = null;
  }

  // Adding an event listener for "keyup" events within the host container
  @HostListener("keyup", ["$event"])
  onKeyUp(e){
    this._updateStructureJson(e);
  }

  // Adding an event listener for "keydown" events within the host container
  @HostListener("keydown", ["$event"])
  onKeyDown(e){
    // Getting the text area element and storing it temporarily, so that it
    // can be used within the updateStructureJson method
    this._textarea = <HTMLTextAreaElement> e.target;

    // Storing the current position of the cursor (based on an index value between
    // 0 and the length of the string)
    this._cursorPosition = e.target.selectionStart;

    // Creating temporary variables, which will be used to determine which 
    // operation to complete on the JSON string (which will be passed to the
    // call to the updateStructureJson function)
    var deletePrevChar = false;
    var deleteSelection = false;
    var tabBackwards = false;
    var appendChar = "";

    // ENTER key
    if(e.key.toLowerCase() == "enter" || e.keyCode == 13){
      // Preventing the default functionality 
      e.preventDefault();

      // Setting the append character to the new line character
      appendChar = "\n";
    }

    // BACKSPACE key
    if(e.key.toLowerCase() == "backspace" || e.keyCode == 8){
      // Checking if there is a selection or the cursor is at 
      // a single point i.e. if the selection end minus the 
      // selection start is 0, then nothing is selected
      if(e.target.selectionEnd - e.target.selectionStart > 0){
        deleteSelection = true;
      } else {
        deletePrevChar = true;
      }
    }

    // TAB key
    if(e.key.toLowerCase() == "tab" || e.keyCode == 9){
      // Preventing the events default operation i.e. changing inputs
      e.preventDefault();

      // Checking if the shift key was also held down
      if(e.shiftKey){
        // tabbing backwards
        tabBackwards = true;
      } else {
        // Appending the tab character to the string
        appendChar = "\t";
      }
    }

    // Updating the structure json, passing in the event, any characters that
    // need to be appended, as well as boolean values for whether a character
    // needs to be deleted, whether a selection needs to be deleted, and whether
    // an inverse tab has occured (i.e. holding shift and tab together to go backwards)
    this._updateStructureJson(e, appendChar, deletePrevChar, deleteSelection, tabBackwards);
  }

  private _updateStructureJson(e=null, appendChar="", deletePrevChar=false, deleteSelection=false, tabBackwards=false){
    // Checking if an event object has been passed to the request
    if(e != null){
      if(deleteSelection){
        // Slicing the JSON string from 0 to the start of the selection, and then
        // joining on the remaining part of the string, following the end of the selection
        this.codeJson = this.codeJson.slice(0, e.target.selectionStart) + this.codeJson.slice(e.target.selectionEnd + 1);
        // Updating the cursor position to be one behind where it was (as long as it is not at the
        // start of the string already) - this will update the selectionStart of the textarea 
        // every time a check occurs
        this._cursorPosition = this._cursorPosition > 1 ? this._cursorPosition - 1 : this._cursorPosition;
      } else if(deletePrevChar){
        // Updating the cursor position to be one behind where it was (as long as it is not at the
        // start of the string already) - this will update the selectionStart of the textarea 
        // every time a check occurs
        this._cursorPosition = this._cursorPosition > 1 ? this._cursorPosition - 1 : this._cursorPosition;      
      } else if(tabBackwards){
        // Getting the character immediatley before cursor
        var prevChar = this.codeJson.slice(this._cursorPosition-1, this._cursorPosition);
        // Checking if the previous character, with all white space removed, contains any characters
        // as tabbing backwards will only work if tabbing into white space
        if(prevChar.replace(/\s/g, "").length == 0){
          // Slicing the string from 0 to one before the cursor position, and joining on the remaining
          // string from the cursor position onwards
          this.codeJson = this.codeJson.slice(0, this._cursorPosition-1) + this.codeJson.slice(this._cursorPosition);
          // Updating the cursor position to be one behind where it was (as long as it is not at the
          // start of the string already) - this will update the selectionStart of the textarea 
          // every time a check occurs
          this._cursorPosition = this._cursorPosition > 1 ? this._cursorPosition - 1 : this._cursorPosition;
        }
      } else if(appendChar.length > 0) {
        // Slicing the string based on the cursor position, and joining the append character into
        // the middle of these new strings
        this.codeJson = this.codeJson.slice(0, this._cursorPosition) + appendChar + this.codeJson.slice(e.target.selectionEnd);
        this._cursorPosition += 1;
      } else {
        // Updating the cursor position to be one behind where it was (as long as it is not at the
        // start of the string already) - this will update the selectionStart of the textarea 
        // every time a check occurs
        this._cursorPosition += 1;
      }
    }

    // Using the customJsonPipe to parse the updated json code to an object
    var tmpObj:any = this._jsPipe.transform(this.codeJson, "parse");

    // Checking if the object is null (i.e. it will be null if the json did 
    // not parse to a valid object)
    if(tmpObj != null){
      // Emitting a code update event with the temporary object included,
      // so that the cms component can update its project structure, so that
      // the input preview will also update to reflect it
      this.codeUpdated.emit(tmpObj);

      // If format JSON is turned on, stringifying the temporary object back
      // to JSON, where the pipe will have indented it appropriatley
      if(this._formatJson){
        this.codeJson = this._jsPipe.transform(tmpObj, "stringify");
        // Turning format JSON off again
        this._formatJson = false;
      }
    }
  }
}
