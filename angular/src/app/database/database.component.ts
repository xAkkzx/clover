import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent {

  @Input() items: string[] = [];
  onMenuItemClick(item: string): void {
    console.log(`Hai cliccato su: ${item}`);
  }

}
