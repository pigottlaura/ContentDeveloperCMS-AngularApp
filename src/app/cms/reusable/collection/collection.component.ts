import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {
  @Input() collection:string;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  @Input() viewContent:boolean;
  @Input() topLevelCollection:Boolean = false;

  constructor() { }

  ngOnInit() {
  }

  onChanges(changes){
    console.log(changes);
  }
}
