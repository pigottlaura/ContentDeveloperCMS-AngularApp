import { Directive, ElementRef, AfterViewInit, DoCheck } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";

@Directive({
  selector: '[appFormControl]'
})
export class FormControlDirective implements AfterViewInit, DoCheck {
  private _formElement;

  constructor(private _el:ElementRef, private _cdService:ContentDeveloperServerService) { }

  ngAfterViewInit(){
    this._formElement = this._el.nativeElement;
  }

  ngDoCheck(){
    if(this._formElement != null){
      if(this._formElement.hasAttribute("required")){
        if(this._formElement.value == null || this._formElement.value.length == 0){
          //this._cdService.submitContentAllowed = false;
          console.log("Value required for this input");
        }
      } else if(this._formElement.getAttribute("data-required") == "true"){
        if(this._formElement.innerHTML == null || this._formElement.innerHTML.length == 0){
          //this._cdService.submitContentAllowed = false;
          console.log("Value required for this input");
        }
      }
    }
  }
}
