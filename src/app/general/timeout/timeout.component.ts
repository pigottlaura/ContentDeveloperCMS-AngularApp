import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-timeout',
  templateUrl: './timeout.component.html',
  styleUrls: ['./timeout.component.css']
})
export class TimeoutComponent implements OnChanges {
  @Input() minutesRemaining:number;
  @Input() sessionExpired:boolean;
  @Output() requestToDismissWarning:EventEmitter<void> = new EventEmitter<void>();
  private _warningMessage:string = "";

  ngOnChanges(changes){
    if(changes.sessionExpired && this.sessionExpired){
        this._warningMessage = "Your session has expired.Please log in again to access your admin panel.";
    } else if(changes.minutesRemaining){
      this._warningMessage = "Your session will expire in " + Math.floor(this.minutesRemaining) + " minutes. Please refresh or save your content to the server to remain logged in";
    }
  }

  dismissWarning(){
    this.requestToDismissWarning.emit();
  }
}
