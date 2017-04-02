import { Directive, ElementRef, AfterViewInit, DoCheck, OnDestroy } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { TitlePipe } from "./../../../../pipes/title.pipe";

@Directive({
  selector: '[appFormControl]'
})
export class FormControlDirective implements AfterViewInit, DoCheck, OnDestroy {
  private _formElement;

  constructor(private _el:ElementRef, private _tPipe:TitlePipe, private _cdService:ContentDeveloperServerService) { }

  ngAfterViewInit(){
    this._formElement = this._el.nativeElement;
  }

  ngDoCheck(){
    if(this._formElement != null){
      var inputName = this._getInputName();
      if(this._formElement.getAttribute("data-validate") == "true"){
        var error;

        if(this._formElement.hasAttribute("required") && this._formElement.validity.valueMissing){
          error = "this is a required field";
        } else if(this._formElement.hasAttribute("max") && this._formElement.validity.rangeOverflow){
          error = "this exceeds the maximum value of " + this._formElement.getAttribute("max");
        } else if(this._formElement.hasAttribute("min") && this._formElement.validity.rangeUnderflow){
          error = "this is less than the minimum value of " + this._formElement.getAttribute("min");
        } else if(this._formElement.hasAttribute("maxlength") && this._formElement.validity.tooLong){
          error = "this exceeds the maximum length of " + this._formElement.getAttribute("maxlength");
        } else if(this._formElement.getAttribute("data-required") == "true"){
          switch(this._formElement.tagName.toLowerCase()){
            case "div":{
              if(this._formElement.innerHTML == null || this._formElement.innerHTML.length == 0){
                error = "this is a required field";
              }
              break;
            }
            case "input":{
              if(this._formElement.getAttribute("data-url") == null || this._formElement.getAttribute("data-url").length == 0){
                error = "this is a required field";
              }
              break;
            }
          }
        } else if(this._formElement.getAttribute("data-maxlength") == "true"){
          if(this._formElement.innerHTML == null || this._formElement.innerHTML.length > this._formElement.getAttribute("maxlength")){
            error = "this exceeds the maximum length of " + this._formElement.getAttribute("maxlength");
          }
        }

        if(error != null){
          this._cdService.updateContentError(inputName, error.replace("this", "'" + inputName + "' "));
          this._formElement.setAttribute("data-error", error);
        } else {
          this._cdService.deleteContentError(inputName);
          this._formElement.removeAttribute("data-error");
        }
      } else {
        this._cdService.deleteContentError(inputName);
        this._formElement.removeAttribute("data-error");
      }
    }
  }

  ngOnDestroy(){
    if(this._formElement != null){
      var inputName = this._getInputName();
      this._cdService.deleteContentError(inputName);
      this._formElement.removeAttribute("data-error");
      this._formElement = null;
    }
  }

  private _getInputName():string{
    var inputName = this._tPipe.transform(this._formElement.getAttribute("data-name").replace(/\//g, " > "));
    return inputName;
  }
}
