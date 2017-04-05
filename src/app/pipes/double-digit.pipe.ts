import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'doubleDigit'
})
export class DoubleDigitPipe implements PipeTransform {

  transform(num:number):string {
    // If the number is less than 10, prepending it with a 0, 
    // otherwise prepending it with an empty string (to implicitly
    // cast it to a string)
    let result = num < 10 ? "0" + num : "" + num;

    // Returning the result to the caller i.e. "01"
    return result;
  }
}
