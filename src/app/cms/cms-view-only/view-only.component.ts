import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cms-view-only',
  templateUrl: './view-only.component.html',
  styleUrls: ['./view-only.component.css']
})
export class ViewOnlyComponent {
  // Inputs to allow these values to be bound to this component
  @Input() projectStructure;
  @Input() projectContent;
  @Input() customCss:string;
}
