import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  @Input() collection:Object;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;

  constructor() { }

  ngOnInit() {
  }

}
