import { Pipe, PipeTransform } from '@angular/core';
import { DoubleDigitPipe } from "./double-digit.pipe";

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  // Creating a private variable to store the array on Months
  private _months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

  // Injecting the custom doubleDigitPipe, which will be used to ensure months
  // and days are always displayed as two digit values i.e. 1 will become 01
  constructor(private _ddPipe:DoubleDigitPipe){}

  transform(date:string, shortDate:boolean=false, includeTime:boolean=true):string{
    // Creating a new data object, from the date passed to the method
    var dateObj = new Date(date);

    // Creating an empty string, which will store the resulting date string
    var dateString = "";

    // Transforming the "day" of the month into a double digit value
    var doubleDigitDay = this._ddPipe.transform(dateObj.getDate());

    // Checking if this is to be a short date (04/04/2017) or a long
    // date (04 Apr 2017)
    if(shortDate){
      // For short dates, double digit representations of the month will be used
      var doubleDigitMonth = this._ddPipe.transform(dateObj.getMonth() + 1);

      // Setting the date string to the date month and year of the date, seperated
      // by forward slashes i.e. 04/04/2017
      dateString = doubleDigitDay + "/" + doubleDigitMonth + "/" + dateObj.getFullYear();
    } else {
      // For long dates, the month's string representation will be used. Getting the appropriate
      // month from the months array, using the month value of the date.
      // Setting the date string to the day month and year of the date, seperated 
      // by spaces i.e. 04 Apr 2017 
      dateString = doubleDigitDay + " " + this._months[dateObj.getMonth()] + " " + dateObj.getFullYear();
    }
    
    // Checking if the time is to be included
    if(includeTime){
      // Determing the am/pm value for the time based on the hour of the date
      let amPm = dateObj.getHours() < 12 ? "am" : "pm";

      // Appending the time to the date string, seperated by : 12:52pm
      dateString += " " + this._ddPipe.transform(dateObj.getHours()) + ":" + this._ddPipe.transform(dateObj.getMinutes()) + amPm;
    }
    
    // Returning the date string to the caller
    return dateString;
  }
}
