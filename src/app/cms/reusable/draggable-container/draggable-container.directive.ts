import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { KeyValArrayPipe } from "./../../../pipes/key-val-array.pipe";

@Directive({
  selector: 'app-draggable-container'
})
export class DraggableContainerDirective implements AfterViewInit {
  // Inputs to allow these properties to be bound to this component
  @Input() content;
  @Input() contentEncapsulationPath:string;
  @Input() contentType:string;

  // Outputs to emit events to the parent component
  @Output() contentReordered:EventEmitter<Object> = new EventEmitter<Object>();

  // Variables that will only be used within this directive, to
  // monitor the drag and drop activity that occurs within it
  _containerElement;
  _dragStartY:number;
  _draggingElement;

  // Injecting the element ref, so that the native element of the container
  // can be loaded from the DOM. Injecting the key value array pipe, so that
  // the keys of an object can be loaded as an array, and looped through 
  // (for reordering)
  constructor(private _el:ElementRef, private _kvaPipe:KeyValArrayPipe){}

  ngAfterViewInit(){
    // Once the DOM is built, loading the native element that this directive
    // was placed on
    this._containerElement = this._el.nativeElement;
  }

  // Event listener for drag start events on the HostListener
  // i.e. when a draggable item starts to be dragged
  @HostListener("dragstart", ["$event"])
  onDragStart(e){
    // Storing the y position of the event, so that it can be
    // determined if the drag direction was "up" or "down" when it is dropped
    this._dragStartY = e.screenY;

    // Checking that the parent of the element being dragged, is this container
    if(e.target.parentNode == this._containerElement){
      // Storing the element being dragged
      this._draggingElement = e.target;
      // Adding an attribute to show it is being dragged (css rules will apply
      // appropriate styles using this attribute)
      this._draggingElement.setAttribute("data-dragging", "true");
    }    
  }

  // Event listener for drag over events on the HostListener
  // i.e. when the dragging of an element finished
  @HostListener("dragover", ["$event"])  
  onDragOver(e) {
      // The default action of this event is to reset the drag operation
      // to none. Preventing this from happening, so that the "drop" event
      // will occur, so the item can be moved within the DOM
      e.preventDefault();
  }

  // Event listener for drag enter events on the HostListener
  // i.e. when a draggable item is dragged over another elment
  @HostListener("dragenter", ["$event"])
  onDragEnter(e){
    // Checking that the element that is now under the dragging
    // element is also a child of this container
    if(e.target.parentNode === this._containerElement){
      // Adding an attribute to show it is being dragged over (css rules will apply
      // appropriate styles using this attribute)
      e.target.setAttribute("data-draggingover", "true");
    }
    e.stopPropagation();
  }

  // Event listener for drag leave events on the HostListener
  // i.e. when a draggable item is dragged away from an element
  // it was previously over
  @HostListener("dragleave", ["$event"])
  onDragLeave(e){
    // Removing the dragging over attribute (as this element can
    // no longer be dropped onto)
    e.target.removeAttribute("data-draggingover");
  }

  // Event listener for drop events on the HostListener
  // i.e. when a draggable item is dropped (after dragend)
  @HostListener("drop", ["$event"])
  onDrop(e){
    // Removing the styling attributes
    this._draggingElement.removeAttribute("data-dragging");
    e.target.removeAttribute("data-draggingover");

    // Checking that the dragging element exists, and that the element it was dropped
    // on is a child of the container element
    if(this._draggingElement != null && e.target.parentNode === this._containerElement){
      // Determining the direction of the drag (i.e. up or down) based on
      // the current screen y, and the y when the drag started
      var direction:number = e.screenY < this._dragStartY ? -1 : 1;

      // Creating a drag data object, with the direction of the drag, 
      // and the keys of the element that was being dragged, and the
      // element that was dropped on
      var dragData = {
        dragDirection: direction,
        keys: {
          elementDragged: this._draggingElement.getAttribute("data-key"),
          elementDroppedOn: e.target.getAttribute("data-key")
        }          
      };

      // Clearing the dragging variables
      this._draggingElement = null;
      this._dragStartY = null;
      
      // Reordering the relevant content using the drag data object created above
      this._reorderContent(dragData);
    }	
    e.stopPropagation();			
  }

  private _reorderContent(dragData){
    if(this.content != null){
      // Creating  a variable to store the reordered content
      var reorderedContent;

      // Reordering the content based on it being an array or an object
      if(this.contentType == "array"){
        reorderedContent = this._reorderArray(dragData);
      } else {
        reorderedContent = this._reorderObject(dragData);
      } 

      // Creating a data object to store the result of the
      // reordering, so it can be added as the payload for the 
      // event that will be emitted
      var reorderedContentData = {
        path: this.contentEncapsulationPath,
        content: reorderedContent
      };
      
      // Emitting the content reordered event, with the reorder data created above
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
          // Adding the element that was dragged, before the one it was dropped on
          reorderedContent[dragData.keys.elementDragged] = this.content[dragData.keys.elementDragged];
          reorderedContent[dragData.keys.elementDroppedOn] = this.content[dragData.keys.elementDroppedOn];
        } else if(currentContentKeys[i] != dragData.keys.elementDragged) {
          // Allowing these keys to be added back in their original order
          reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
        }    
      }
    } else if(dragData.dragDirection > 0){
      // Down
      for(var i=0; i< currentContentKeys.length; i++){
        if(currentContentKeys[i] == dragData.keys.elementDroppedOn) {
          // Adding the element that was dragged after the element that was dropped on
          reorderedContent[dragData.keys.elementDroppedOn] = this.content[dragData.keys.elementDroppedOn];
          reorderedContent[dragData.keys.elementDragged] = this.content[dragData.keys.elementDragged];
        } else if(currentContentKeys[i] != dragData.keys.elementDragged) {
          // Allowing these keys to be added back in their original order
          reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
        }    
      }
    }

    // Returning the reordered object
    return reorderedContent;
  }

  private _reorderArray(dragData){
    var reorderedContent = [];
    var currentContentKeys = [];
    
    // Looping through the content to get the current keys order
    for(let index in this.content){
      currentContentKeys.push(index);
    }

    if(dragData.dragDirection < 0){
        //Up
        var droppedItemFound:boolean = false;
        var draggedItemFound:boolean = false;
        for(var i=0; i< currentContentKeys.length; i++){
          if(currentContentKeys[i] == dragData.keys.elementDroppedOn) {
            // If this was the element that was dropped on, then adding the dragged element
            // at this position, and the dropped element at the next position
            reorderedContent[currentContentKeys[i]] = this.content[dragData.keys.elementDragged];
            reorderedContent[currentContentKeys[i+1]] = this.content[dragData.keys.elementDroppedOn];
            // Setting dropped item found to true
            droppedItemFound = true;
            // If the next item was the dragged element, setting dragged item found to 
            // true (so it wont be looked for again)
            if(currentContentKeys[i+1] == dragData.keys.elementDragged){
              draggedItemFound = true;
            }
            // Incremting i, as I have just updated 2 array indexes (so the next
            // index should be skipped)
            i++;
          } else if(currentContentKeys[i] == dragData.keys.elementDragged) {
            // If this is the element that was dragged, then setting it equal to the previous index
            // in the original content
            reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i-1]];
            draggedItemFound = true;
          } else {
            if(droppedItemFound && draggedItemFound == false){
              // If the dropped item has been found, but the dragged item is not yet found,
              // then moving everything down one position in the array
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i-1]];
            } else {
              // Allowing these items to be entered in their original order
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
            // If this was the element that was dropped on, then adding the dropped element
            // at this position, and the dragged element at the next position
            reorderedContent[currentContentKeys[i]] = this.content[dragData.keys.elementDroppedOn];
            reorderedContent[currentContentKeys[i+1]] = this.content[dragData.keys.elementDragged];
            // Setting dropped item found to true
            droppedItemFound = true;
            // Incremting i, as I have just updated 2 array indexes (so the next
            // index should be skipped)
            i++;
          } else if(currentContentKeys[i] == dragData.keys.elementDragged) {
            // If this is the element that was dragged, then setting it equal to the next index
            // in the original content
            reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i+1]];
            draggedItemFound = true;
          } else {
            if(draggedItemFound && droppedItemFound == false){
              // If the dragged item has been found, but the dropped item is not yet found,
              // then moving everything up one position in the array
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i+1]];
            } else {
              // Allowing these items to be entered in their original order
              reorderedContent[currentContentKeys[i]] = this.content[currentContentKeys[i]];
            }
          }   
        }
      }

      // Returning the reordered array content to the caller
      return reorderedContent;
  }
}