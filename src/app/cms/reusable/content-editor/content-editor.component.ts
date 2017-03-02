import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit {
  @Input() viewContent:boolean;
  @Input() projectContent:Object;
  @Input() projectStructure:Object;
  currentCollection:Object;
  currentCollectionName:string;

  constructor() { }

  ngOnInit() {
  }

  viewCollection(collection){
    this.currentCollection = collection;
    this.currentCollectionName = collection;
  }

}
