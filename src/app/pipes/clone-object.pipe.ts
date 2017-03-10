import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloneObject'
})
export class CloneObjectPipe implements PipeTransform {

  transform(originalObject:Object, args?: any):Object {
    let stringifiedObject = JSON.stringify(originalObject);
    let cloneOfObject = JSON.parse(stringifiedObject); 
    return cloneOfObject;
  }

}
