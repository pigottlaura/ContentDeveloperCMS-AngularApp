import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cms-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  @Input() projectContent;
  @Input() projectStructure;
  
  constructor() {}

  ngOnInit() {
  }

}
