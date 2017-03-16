import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  @Input() isAdmin:boolean = false;
  @Output() requestToChangeView:EventEmitter<string> = new EventEmitter<string>();

  changeView(toView:string){
    this.requestToChangeView.emit(toView);
  }
}
