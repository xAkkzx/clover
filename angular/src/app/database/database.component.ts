import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent {
  @Input() nome:string ='';
  @Input() items: string[] = [];
  cambiacss=false;

  onMenuItemClick(item: string): void {
    this.nome= item;
    console.log(`Hai cliccato su: ${item}`);
  }

  change(v: boolean){
    this.cambiacss=v;
    console.log("jfkdinvj");  
  }

}
