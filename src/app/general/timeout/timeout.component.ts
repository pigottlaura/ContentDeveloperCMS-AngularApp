import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-timeout',
  templateUrl: './timeout.component.html',
  styleUrls: ['./timeout.component.css']
})
export class TimeoutComponent implements OnChanges {
  // Creating inputs, for the minutes remaining before
  // a session timeout, and a boolean to determine whether the session
  // has expired or not, so that the values for these can be bound
  // to the component when it is added as a sub-component
  @Input() minutesRemaining:number;
  @Input() sessionExpired:boolean;

  // Creating an output, that will emit events when a user requests
  // to dismiss a timeout warning (either for impending, or expired timeouts)
  @Output() requestToDismissWarning:EventEmitter<void> = new EventEmitter<void>();

  // Variable only used within this comonent, which stores the seconds remaining,
  // which will be derived from the minutes remainaing, every time it changes
  _secondsRemaining: number = 0;

  ngOnChanges(changes){
    if(changes.minutesRemaining){
      // Setting the seconds remaining to be the remainder of the minutes 
      // remaining divided by 1 i.e. to get the decimal off the value (if
      // there are 3.5 minutes remaining, then the result will be 0.5).
      // Multiplying this value by 60, to get the number of seconds this value
      // represents i.e. if the remainder of the modulus equation is 0.5, then
      // 0.5 * 60 means that there are 30 seconds remaining (half a minute).
      // Storing this value as a rounded down version of this result, incase
      // any decimal value remains
      this._secondsRemaining = Math.floor((this.minutesRemaining % 1 ) * 60);

      // Every time the minutes remaining value changes, setting it to
      // it's own value, rounded down i.e. the "minutesRemaining" value 
      // passed in will be in decimal format
      this.minutesRemaining = Math.floor(this.minutesRemaining);
    }
  }

  dismissWarning(){
    // Emitting the "dismiss warning" event, so that this components template
    // can be hidden (or in the case of a session expiry, the user can be returned
    // to the login page)
    this.requestToDismissWarning.emit();
  }
}
