import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent {
  @Input() errors:string[];
  @Output() requestToDismissErrors:EventEmitter<void> = new EventEmitter<void>();

  dismissErrors(){
    this.requestToDismissErrors.emit();
  }
}
