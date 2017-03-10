import { Pipe, PipeTransform } from '@angular/core';
import { UpperCamelCasePipe } from "./upper-camel-case.pipe";

@Pipe({
  name: 'underscoreToSpace'
})
export class UnderscoreToSpacePipe implements PipeTransform {

  transform(stringVal:string):string {
    stringVal += "";
    
    return stringVal.replace(/_/g, " ");;
  }

}
