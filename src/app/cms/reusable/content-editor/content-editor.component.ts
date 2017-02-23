import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.css']
})
export class ContentEditorComponent implements OnInit {
  @Input() viewOnly:boolean;
  @Input() projectContent:Object;

  constructor() { }

  ngOnInit() {
  }

}
