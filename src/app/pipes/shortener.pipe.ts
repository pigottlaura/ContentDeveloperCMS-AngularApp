import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortener'
})
export class ShortenerPipe implements PipeTransform {
  // This pipe allows any string to be shortened to the
  // length specified. The need for this arose from needing
  // to create shortened versions of commit hashes in component
  // templates (where I still wanted the long version of the 
  // commit hash to remain uneffected)

  transform(stringVal:string, length:number):string {
    // Returning the original string, sliced from the 
    // it's first character to the requested length 
    // i.e. if the string was "laura" and the length
    // was 2, the result would be "la"
    return stringVal.slice(0, length);
  }

}
