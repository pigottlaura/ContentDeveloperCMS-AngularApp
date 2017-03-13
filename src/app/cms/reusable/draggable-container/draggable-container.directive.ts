import { Directive, ElementRef, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
  selector: 'app-draggable-container'
})
export class DraggableContainerDirective implements AfterViewInit {
  @Input() itemsEncapsulationPath:string;
  @Output() itemsReordered:EventEmitter<Object> = new EventEmitter<Object>();

  private _containerElement;
  private _dragStartY:number;
  private _draggingElement;

  constructor(private _el:ElementRef){}

  ngAfterViewInit(){
    this._containerElement = this._el.nativeElement;
  
    for(var i=0; i<this._containerElement.children.length; i++){
      // Setting the draggable property of each child of the draggable 
      // container to true, so that it can be dragged
      this._containerElement.children[i].setAttribute("draggable", "true");
    }
  }

  @HostListener("dragstart", ["$event"])
  onDragStart(e){
    this._dragStartY = e.screenY;
    if(e.target.parentNode == this._containerElement){
      this._draggingElement = e.target;
    }    
  }

  @HostListener("dragover", ["$event"])  
  onDragOver(e) {
      // The default action of this event is to reset the drag operation
      // to none. Preventing this from happening, so that the "drop" event
      // will occur, so the item can be moved within the DOM
      e.preventDefault();
  }

  @HostListener("drop", ["$event"])
  onDrop(e){
    if(this._draggingElement != null && e.target.parentNode === this._containerElement){
        this._containerElement.removeChild(this._draggingElement);
        var direction:number = 0;
        if(e.screenY < this._dragStartY){
            direction = -1;
            this._containerElement.insertBefore(this._draggingElement, e.target);
        } else {
            direction = 1;
            this._containerElement.insertBefore(this._draggingElement, e.target.nextSibling);
        }

        var dragData = {
          path: this.itemsEncapsulationPath,
          dragDirection: direction,
          keys: {
            elementDragged: this._draggingElement.getAttribute("data-key"),
            elementDroppedOn: e.target.getAttribute("data-key"),
            newOrder: []
          }          
        }

        for(var i=0; i<this._containerElement.children.length; i++){
          dragData.keys.newOrder.push(this._containerElement.children[i].getAttribute("data-key"));
        }
        
        this.itemsReordered.emit(dragData);

        this._draggingElement = null;
        this._dragStartY = null;
    }				
  }
}