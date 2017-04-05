import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-cms-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  // Input to allow the users access level for this project to be bound to this component,
  // as it will effect the navigation options available to them
  @Input() userAccessLevel:number;

  // Outputs to emit events to the parent component (either cms-admin, cms-editor
  // or cms-view-only) as each of these will control their sub navigation
  @Output() requestToChangeView:EventEmitter<string> = new EventEmitter<string>();

  changeView(toView:string){
    // Emitting the event to change the view to that requested by the user
    this.requestToChangeView.emit(toView);
  }
}
