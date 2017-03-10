import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortener'
})
export class ShortenerPipe implements PipeTransform {

  transform(stringVal:string, length:number):string {
    return stringVal.slice(0, length);
  }

}
