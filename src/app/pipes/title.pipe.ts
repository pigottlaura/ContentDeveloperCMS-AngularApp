import { Pipe, PipeTransform } from '@angular/core';
import { UpperCamelCasePipe } from "./upper-camel-case.pipe";
import { UnderscoreToSpacePipe } from "./underscore-to-space.pipe";

@Pipe({
  name: 'title'
})
export class TitlePipe implements PipeTransform {
  // All properties on a projects structure will be defined as lowercase
  // with underscores seperating the words. This pipe allows these properties
  // (or "titles", as they are used in the application, to name collections
  // and labels for collections) to be transformed back to upper case words
  // i.e. contact_details would become "Contact Details"

  // Injecting the custom underscoreToSpacePipe (which replaces underscores with
  // spaces) and the upperCamelCasePipe (which capitalises the first letter of every word)
  constructor(private _utsPipe:UnderscoreToSpacePipe, private _uccPipe:UpperCamelCasePipe){}

  transform(stringVal:string):string {
    // Appending an empty string to the string value, to implicitlty
    // cast it to a string, and ensure it is not null
    stringVal += "";

    // Removing all underscores from the string i.e. "contact_details" becomes "contact details"
    let underscoresRemoved = this._utsPipe.transform(stringVal);

    // Capitalising all words in the string i.e. "contact details" becomes "Contact Details"
    let allWordsToUppercase = this._uccPipe.transform(underscoresRemoved);
    
    // Returning the string to the caller
    return allWordsToUppercase;
  }
}
