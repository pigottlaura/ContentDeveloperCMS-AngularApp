import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: 'app-draggable-container'
})
export class DraggableContainerDirective implements AfterViewInit {
  @Input() itemsEncapsulationPath:string;
  @Output() itemsReordered:EventEmitter<string> = new EventEmitter<string>();

  private _dragStartY:number;
  private _draggingElement;

  constructor(private _el:ElementRef){}

  ngAfterViewInit(){
    var containerElement = this._el.nativeElement;
  
    for(var i=0; i<containerElement.children.length; i++){
      // Setting the draggable property of each child of the draggable 
      // container to true, so that it can be dragged
      containerElement.children[i].setAttribute("draggable", "true");
    }  
    containerElement.addEventListener("dragstart", this.onDragStart);
    containerElement.addEventListener("dragover", this.onDragOver);
    containerElement.addEventListener("drop", this.onDrop);
  }

  onDragStart(e){
    this._dragStartY = e.screenY;
    this._draggingElement = e.target;
  }
  
  onDragOver(e) {
      // The default action of this event is to reset the drag operation
      // to none. Preventing this from happening, so that the "drop" event
      // will occur, so the item can be moved within the DOM
      e.preventDefault();
  }
  
  onDrop(e){
    if(this._draggingElement != null && this._draggingElement.parentNode === e.target.parentNode){
        e.target.parentNode.removeChild(this._draggingElement);
        if(e.screenY < this._dragStartY){
            e.target.parentNode.insertBefore(this._draggingElement, e.target);
        } else {
            e.target.parentNode.insertBefore(this._draggingElement, e.target.nextSibling);
        }

        /*
        if(typeof adminDropEvent == "function"){
            var draggingElementNewIndex = getChildIndex(e.target.parentNode, draggingElement);
            adminDropEvent(draggingElement.getAttribute("data-collection"), draggingElementNewIndex);
        }
        */

        this._draggingElement = null;
        this._dragStartY = null;

        this.itemsReordered.emit(this.itemsEncapsulationPath);
    }				
  }
}