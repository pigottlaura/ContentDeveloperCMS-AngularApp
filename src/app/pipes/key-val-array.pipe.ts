import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValArray'
})
export class KeyValArrayPipe implements PipeTransform {

  transform(object:Object, get:string): any[] {
    var result = [];

    for(let key in object){
      if(get == null){
        result.push({});
        result[result.length-1][key] = object[key];
      } else if(get == "keys"){
        result.push(key);
      } else if(get == "values"){
        result.push(object[key]);
      }
    }   

    return result;
  }

}
