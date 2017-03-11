import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() user:Object;
  @Input() pageTitle:string;
  @Output() requestToLogout:EventEmitter<void> = new EventEmitter<void>();

  logoutClicked(){
    this.requestToLogout.emit();
  }
}
