import { Pipe, PipeTransform } from '@angular/core';
import { UpperCamelCasePipe } from "./upper-camel-case.pipe";
import { UnderscoreToSpacePipe } from "./underscore-to-space.pipe";

@Pipe({
  name: 'title'
})
export class TitlePipe implements PipeTransform {

  constructor(private _utsPipe:UnderscoreToSpacePipe, private _uccPipe:UpperCamelCasePipe){}

  transform(stringVal:string):string {
    stringVal += "";
    let underscoresRemoved = this._utsPipe.transform(stringVal);
    let allWordsToUppercase = this._uccPipe.transform(underscoresRemoved);
    
    return allWordsToUppercase;
  }

}
