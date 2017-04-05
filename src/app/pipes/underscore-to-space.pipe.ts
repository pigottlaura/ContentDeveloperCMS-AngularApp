import { Pipe, PipeTransform } from '@angular/core';
import { UpperCamelCasePipe } from "./upper-camel-case.pipe";

@Pipe({
  name: 'underscoreToSpace'
})
export class UnderscoreToSpacePipe implements PipeTransform {

  transform(stringVal:string):string {
    // Appending an empty string to the string value, to implicitlty
    // cast it to a string, and ensure it is not null
    stringVal += "";
    
    // Replacing all underscores with spaces
    return stringVal.replace(/_/g, " ");
  }

}
