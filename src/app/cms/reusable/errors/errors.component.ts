import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent {
  // Inputs to allow these properties to be bound to this component
  @Input() errors:string[];

  // Outputs to emit events to the parent component
  @Output() requestToDismissErrors:EventEmitter<void> = new EventEmitter<void>();

  dismissErrors(){
    // Emitting the request to dismiss errors to the parent
    this.requestToDismissErrors.emit();
  }
}
