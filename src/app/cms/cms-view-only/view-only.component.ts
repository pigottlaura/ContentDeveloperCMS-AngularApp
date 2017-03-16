import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cms-view-only',
  templateUrl: './view-only.component.html',
  styleUrls: ['./view-only.component.css']
})
export class ViewOnlyComponent {
  @Input() projectStructure;
  @Input() projectContent;
  @Input() customCss:string;
}
