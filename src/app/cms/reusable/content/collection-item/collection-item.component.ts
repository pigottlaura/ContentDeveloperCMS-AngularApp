import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, DoCheck } from '@angular/core';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.css']
})
export class CollectionItemComponent implements AfterViewInit, DoCheck{
  // Inputs to allow these properties to be bound to this component
  @Input() itemName:string;
  @Input() itemStructure:Object;
  @Input() itemContent:Object;
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean = false;
  @Input() encapsulationPath:string;

  // Outputs to emit events to the parent component
  @Output() itemContentChanged:EventEmitter<Object> = new EventEmitter<Object>();

  // Creating variables that will only be used within this component
  _contentInputElement;
  _contentError:string;

  // Injecting the element ref, so that the input element can be loaded from the DOM
  constructor(private _el:ElementRef) {}

  ngAfterViewInit(){
    // Once the DOM has rendered, loading the relevant input from the DOM. While there
    // are many possible inputs that could be used in this component, only one
    // will ever be used in each instance (depending on the structure requirements)
    this._contentInputElement = this._el.nativeElement.getElementsByClassName("contentInput")[0];
  }

  ngDoCheck(){
    // Checking for validation errors
    if(this._contentInputElement != null && this._contentInputElement.hasAttribute("data-error")){
        this._contentError = this._contentInputElement.getAttribute("data-error");
    } else {
      this._contentError = null;
    }
  }

  contentChanged(updatedContent=null){
    // Checking that content has been included as the event payload, and that
    // the content is not just an event
    if(updatedContent != null && updatedContent.constructor.name.toLowerCase() != "event"){
      // Emitting the content changed event, with the encapsulation path and the content 
      // that was included in the event
      this.itemContentChanged.emit({path: this.encapsulationPath, content:updatedContent});
    } else {
      // Emitting the content changed event, with the encapsulation path and the content 
      // that this item currently contains
      this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
    }
  }
}
