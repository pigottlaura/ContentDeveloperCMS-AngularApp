import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'upperCamelCase'
})
export class UpperCamelCasePipe implements PipeTransform {

  transform(stringVal:string, firstWordOnly:boolean=false): any {
    stringVal += "";
    var result = "";
    var words = firstWordOnly ? stringVal.split(" ").slice(0, 1) : stringVal.split(" ");
    
    for(var word of words){
      result += word[0].toUpperCase() + word.slice(1) + " ";
    }
    
    return result;
  }

}
