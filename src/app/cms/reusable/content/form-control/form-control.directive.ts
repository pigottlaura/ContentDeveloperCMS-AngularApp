import { Directive, ElementRef, AfterViewInit, DoCheck, OnDestroy } from '@angular/core';
import { ContentDeveloperServerService } from "./../../../../services/content-developer-server/content-developer-server.service";
import { TitlePipe } from "./../../../../pipes/title.pipe";

@Directive({
  selector: '[appFormControl]'
})
export class FormControlDirective implements AfterViewInit, DoCheck, OnDestroy {
  // Creating a variable that will only be used within this directive,
  // to store the element that this instance will refer to. Note - this
  // will not always be a strictly "form" element, it could be a div
  // that is editable (as in WYSIWYG HTML inputs)
  _formElement;

  // Injecting the element ref (to access the element that this directive was place on, 
  // in the DOM, so it can be checked and validated), the title pipe (to convert
  // input names from lowercase underscores to upper case spaced i.e. "contact_details"
  // to "Contact Details"). Injecting the cdService, so that any content
  // errors can be stored there, to be accessible throughout the app, and used to preform
  // checks before content is saved
  constructor(private _el:ElementRef, private _tPipe:TitlePipe, private _cdService:ContentDeveloperServerService) { }

  ngAfterViewInit(){
    // After the DOM is built, getting the native element that had this
    // directive applied to it
    this._formElement = this._el.nativeElement;
  }

  ngDoCheck(){
    // Checking that the element has been initialised
    if(this._formElement != null){
      // Getting the input name, using this components method (so the name
      // will be formatted appropriatly for all requests)
      var inputName = this._getInputName();

      // Checking that this element has a "data-validate" attribute set to
      // true (so that vaildation can be turned off i.e. for view only)
      if(this._formElement.getAttribute("data-validate") == "true"){
        // Creating a temporary variable to store the error
        var error;

        // Checking through all possible validation issues (only allowing one to throw an error,
        // as once this error is resolved, the next can be thrown on the next check)
        if(this._formElement.hasAttribute("required") && this._formElement.validity.valueMissing){
          error = "this is a required field";
        } else if(this._formElement.hasAttribute("max") && this._formElement.validity.rangeOverflow){
          error = "this exceeds the maximum value of " + this._formElement.getAttribute("max");
        } else if(this._formElement.hasAttribute("min") && this._formElement.validity.rangeUnderflow){
          error = "this is less than the minimum value of " + this._formElement.getAttribute("min");
        } else if(this._formElement.hasAttribute("maxlength") && this._formElement.validity.tooLong){
          error = "this exceeds the maximum length of " + this._formElement.getAttribute("maxlength");
        } else if(this._formElement.getAttribute("data-required") == "true"){
          // Since this element is using the "data-required" attribute, in place
          // of the "required" attribute, it is not a traditional input element
          // i.e. it is a div that allows content to be edited, or a hidden file input
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
          // Since this element is using the "data-maxlength" attribute, in place
          // of the "maxlength" attribute, it is not a traditional input element
          // i.e. it is a div that allows content to be edited
          if(this._formElement.innerHTML == null || this._formElement.innerHTML.length > this._formElement.getAttribute("maxlength")){
            error = "this exceeds the maximum length of " + this._formElement.getAttribute("maxlength");
          }
        }

        if(error != null){
          // If there is an error, update this inputs error on the cdService
          // error object (replacing "this" with the inputs name)
          this._cdService.updateContentError(inputName, error.replace("this", "'" + inputName + "' "));
          // Adding the error string to this elements "data-error" attributes, so that
          // it can be picked up by the template
          this._formElement.setAttribute("data-error", error);
        } else {
          // Since no error occured, deleting this inputs error on the cdService
          // object, so that no previous error remains
          this._cdService.deleteContentError(inputName);
          // Removing the "data-error" from this element (incase it had one)
          this._formElement.removeAttribute("data-error");
        }
      } else {
        // Since this input no longer needs to be validated, deleting this inputs 
        // error on the cdService object, so that no previous error remains
        this._cdService.deleteContentError(inputName);
        // Removing the "data-error" from this element (incase it had one)
        this._formElement.removeAttribute("data-error");
      }
    }
  }

  ngOnDestroy(){
    // Checking that this instance had reference to a form element
    if(this._formElement != null){
      // Getting the name of this input
      var inputName = this._getInputName();
      // Deleting this inputs error on the cdService object, so that no 
      // previous error remains
      this._cdService.deleteContentError(inputName);
      // Removing the "data-error" from this element (incase it had one)
      this._formElement.removeAttribute("data-error");
      // Clearing the form element reference
      this._formElement = null;
    }
  }

  private _getInputName():string{
    // Getting the name of the input from its "data-name" attribute. replacing
    // all forward slashes with " > " and then removing underscores and capitalising
    // using the custom title pipe i.e. "home/contact_details" would become "Home > Contact Details"
    var inputName = this._tPipe.transform(this._formElement.getAttribute("data-name").replace(/\//g, " > "));
    return inputName;
  }
}
