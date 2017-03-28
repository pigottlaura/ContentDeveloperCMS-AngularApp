import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit, DoCheck } from '@angular/core';

@Component({
  selector: 'app-collection-item',
  templateUrl: './collection-item.component.html',
  styleUrls: ['./collection-item.component.css']
})
export class CollectionItemComponent implements AfterViewInit, DoCheck{
  @Input() itemName:string;
  @Input() itemStructure:Object;
  @Input() itemContent:Object;
  @Input() viewContent:boolean;
  @Input() viewOnly:boolean = false;
  @Input() encapsulationPath:string;
  @Output() itemContentChanged:EventEmitter<Object> = new EventEmitter<Object>();

  private _contentInputElement;
  private _contentError:string;

  constructor(private _el:ElementRef) {}

  ngAfterViewInit(){
    this._contentInputElement = this._el.nativeElement.getElementsByClassName("contentInput")[0];
  }

  ngDoCheck(){
    if(this._contentInputElement != null && this._contentInputElement.hasAttribute("data-error")){
        this._contentError = this._contentInputElement.getAttribute("data-error");
    } else {
      this._contentError = null;
    }
  }

  contentChanged(updatedContent=null){
    if(updatedContent != null && updatedContent.constructor.name.toLowerCase() != "event"){
      this.itemContentChanged.emit({path: this.encapsulationPath, content:updatedContent});
    } else {
      this.itemContentChanged.emit({path: this.encapsulationPath, content:this.itemContent});
    }
  }
}
