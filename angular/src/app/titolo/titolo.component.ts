import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-titolo',
  template: '<h1>{{ titolo }}</h1>',
  templateUrl: './titolo.component.html',
  styleUrls: ['./titolo.component.css']
})
export class TitoloComponent {
  @Input() titolo: string= '';
}
