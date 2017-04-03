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
    if(changes.minutesRemaining){
      this.minutesRemaining = Math.floor(this.minutesRemaining);
    }
  }

  dismissWarning(){
    this.requestToDismissWarning.emit();
  }
}
