import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cloneObject'
})
export class CloneObjectPipe implements PipeTransform {

  transform(originalObject:Object):Object {
    // Stringifying the object passed to the method, to create a JSON
    // representation of the original object
    let stringifiedObject = JSON.stringify(originalObject);

    // Parsing the JSON back to an object, to create a "clone"
    // without any reference to the original
    let cloneOfObject = JSON.parse(stringifiedObject); 

    // Returning the cloned object back to the caller
    return cloneOfObject;
  }

}
