import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'doubleDigit'
})
export class DoubleDigitPipe implements PipeTransform {

  transform(num:number):string {
    let result = num < 10 ? "0" + num : "" + num;

    return result;
  }
}
