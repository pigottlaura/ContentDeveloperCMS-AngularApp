import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyValArray'
})
export class KeyValArrayPipe implements PipeTransform {
  // Angular *nfFor directives only support looping through arrays,
  // so this pipe allows an object to be represented as an array.
  // It can return all of the objects keys, values or both, in array
  // format, to allow for looping through objects in component templates

  transform(object:Object, get:string): any[] {
    // Creating an empty array, on which to store the resulting values
    var result = [];

    // Looping through every key in the object
    for(let key in object){
      if(get == null){
        // Since no value was defined for "get", assuming the caller
        // wants an array of the key/value pairs. Pushing an empty object 
        // into the array. Would prefer to set the values at this point,
        // but in order to dynamically add an unknown key name to an object,
        // the object needs to exist first
        result.push({});
        // Accessing the most recently added element of the result array (i.e.
        // the new object I just pushed to the array) and setting a property
        // on it (with the name of the current key). Setting this properties
        // value equal to the current key's value i.e. {name: "Laura"}
        result[result.length-1][key] = object[key];
      } else if(get == "keys"){
        // Since the caller only wants the keys, pushing each of these into the
        // result array
        result.push(key);
      } else if(get == "values"){
        // Since the caller only wants the values, pushing each of these into the
        // result array
        result.push(object[key]);
      }
    }   

    // Returning the result array to the caller
    return result;
  }

}
