import { Pipe, PipeTransform } from '@angular/core';
import { DoubleDigitPipe } from "./double-digit.pipe";

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  private _months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

  constructor(private _ddPipe:DoubleDigitPipe){}

  transform(date:string, shortDate:boolean=false, includeTime:boolean=true):string{
    var dateObj = new Date(date);
    var dateString = "";

    var doubleDigitDay = this._ddPipe.transform(dateObj.getDate());

    if(shortDate){
        var doubleDigitMonth = this._ddPipe.transform(dateObj.getMonth() + 1);
        dateString = doubleDigitDay + "/" + doubleDigitMonth + "/" + dateObj.getFullYear();
    } else {
        dateString = doubleDigitDay + " " + this._months[dateObj.getMonth()] + " " + dateObj.getFullYear();
    }
    

    if(includeTime){
        var amPm = dateObj.getHours() < 12 ? "am" : "pm";
        dateString += " " + this._ddPipe.transform(dateObj.getHours()) + ":" + this._ddPipe.transform(dateObj.getMinutes()) + amPm;
    }
    
    return dateString;
  }
}
