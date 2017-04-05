import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  // Variable that will only be used within this component, to store 
  // the current data (so that the copyright notice in the footer can
  // have the year update dynamically)
  _currentDate:Date;

  ngOnInit() {
    // Initialising the current date object to the current date/time
    this._currentDate = new Date();
  }
}
