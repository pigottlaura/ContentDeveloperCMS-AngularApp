import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { KeyValArrayPipe } from "./../../../pipes/key-val-array.pipe";

@Directive({
  selector: 'app-draggable-container'
})
export class DraggableContainerDirective implements AfterViewInit {
  @Input() content;
  @Input() contentEncapsulationPath:string;
  @Input() contentType:string;
  @Output() contentReordered:EventEmitter<Object> = new EventEmitter<Object>();

  private _containerElement;
  private _dragStartY:number;
  private _draggingElement;

  constructor(private _el:ElementRef, private _kvaPipe:KeyValArrayPipe){}

  ngAfterViewInit(){
    this._containerElement = this._el.nativeElement;
  
    for(var i=0; i<this._containerElement.children.length; i++){
      // Setting the draggable property of each child of the draggable 
      // container to true, so that it can be dragged
      //this._containerElement.children[i].setAttribute("draggable", "true");
    }
  }

  @HostListener("dragstart", ["$event"])
  onDragStart(e){
    this._dragStartY = e.screenY;
    if(e.target.parentNode == this._containerElement){
      this._draggingElement = e.target;
      this._draggingElement.setAttribute("data-dragging", "true");
    }    
  }

  @HostListener("dragover", ["$event"])  
  onDragOver(e) {
      // The default action of this event is to reset the drag operation
      // to none. Preventing this from happening, so that the "drop" event
      // will occur, so the item can be moved within the DOM
      e.preventDefault();
  }

  @HostListener("dragenter", ["$event"])
  onDragEnter(e){
    if(e.target.parentNode === this._containerElement){
      e.target.setAttribute("data-draggingover", "true");
    }
    e.stopPropagation();
  }

  @HostListener("dragleave", ["$event"])
  onDragLeave(e){
    e.target.removeAttribute("data-draggingover");
  }

  @HostListener("drop", ["$event"])
  onDrop(e){
    this._draggingElement.removeAttribute("data-dragging");
    e.target.removeAttribute("data-draggingover");
    if(this._draggingElement != null && e.target.parentNode === this._containerElement){
        var direction:number = e.screenY < this._dragStartY ? -1 : 1;

        var dragData = {
          dragDirection: direction,
          keys: {
            elementDragged: this._draggingElement.getAttribute("data-key"),
            elementDroppedOn: e.target.getAttribute("data-key")
          }          
        };

        this._draggingElement = null;
        this._dragStartY = null;
        
        this._reorderContent(dragData);
    }	
    e.stopPropagation();			
  }

  private _reorderContent(dragData){
    if(this.content != null){

      var reorderedContent;
      if(this.contentType == "array"){
        reorderedContent = this._reorderArray(dragData);
      } else {
        reorderedContent = this._reorderObject(dragData);
      } 
      var reorderedContentData = {
        path: this.contentEncapsulationPath,
        content: reorderedContent
      };
      
      this.contentReordered.emit(reorderedContentData);
    }
  }

  private _reorderObject(dragData){
    var reorderedContent = {};
    var currentContentKeys = this._kvaPipe.transform(this.content, "keys");

    if(dragData.dragDirection < 0){
      // Up
      for(var i=0; i< currentContentKeys.length; i++){
        if(currentContentKeys[i] == dragData.keys.elementDroppedOn) {
          reorderedContent[dragData.keys.elementDragged] = this.content[dragData.keys.elementDragged];
          reorderedContent[dragData.keys.elementDroppedOn] = this.content[dragData.keys.elementDroppedOn];
        } else if(currentContentKeys[i] != dragData.keys.elementDragged) {
          reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
        }    
      }
    } else if(dragData.dragDirection > 0){
      // Down
      for(var i=0; i< currentContentKeys.length; i++){
        if(currentContentKeys[i] == dragData.keys.elementDroppedOn) {
          reorderedContent[dragData.keys.elementDroppedOn] = this.content[dragData.keys.elementDroppedOn];
          reorderedContent[dragData.keys.elementDragged] = this.content[dragData.keys.elementDragged];
        } else if(currentContentKeys[i] != dragData.keys.elementDragged) {
          reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
        }    
      }
    }
    return reorderedContent;
  }

  private _reorderArray(dragData){
    var reorderedContent = [];
    var currentContentKeys = [];
    for(let index in this.content){
      currentContentKeys.push(index);
    }
    if(dragData.dragDirection < 0){
        //Up
        var droppedItemFound:boolean = false;
        var draggedItemFound:boolean = false;
        for(var i=0; i< currentContentKeys.length; i++){
          if(currentContentKeys[i] == dragData.keys.elementDroppedOn) {
            reorderedContent[currentContentKeys[i]] = this.content[dragData.keys.elementDragged];
            reorderedContent[currentContentKeys[i+1]] = this.content[dragData.keys.elementDroppedOn];
            droppedItemFound = true;
            if(currentContentKeys[i+1] == dragData.keys.elementDragged){
              draggedItemFound = true;
            }
            i++;
          } else if(currentContentKeys[i] == dragData.keys.elementDragged) {
            reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i-1]];
            draggedItemFound = true;
          } else {
            if(droppedItemFound && draggedItemFound == false){
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i-1]];
            } else {
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
            }
          }    
        }
      } else if(dragData.dragDirection > 0){
        //Down COMPLETED
        var draggedItemFound:boolean = false;
        var droppedItemFound:boolean = false;
        for(var i=0; i< currentContentKeys.length; i++){
          if(currentContentKeys[i+1] == dragData.keys.elementDroppedOn) {
            reorderedContent[currentContentKeys[i]] = this.content[dragData.keys.elementDroppedOn];
            reorderedContent[currentContentKeys[i+1]] = this.content[dragData.keys.elementDragged];
            droppedItemFound = true;
            i++;
          } else if(currentContentKeys[i] == dragData.keys.elementDragged) {
            reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i+1]];
            draggedItemFound = true;
          } else {
            if(draggedItemFound && droppedItemFound == false){
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i+1]];
            } else {
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
            }
          }   
        }
      }
      return reorderedContent;
  }
}