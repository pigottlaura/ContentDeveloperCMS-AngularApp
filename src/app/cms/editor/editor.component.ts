import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cms-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @Input() projectContent;
  @Input() projectStructure;

  constructor() { }

  ngOnInit() {
  }

}
