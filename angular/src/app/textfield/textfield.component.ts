import { Component } from '@angular/core';
import { Input } from '@angular/core';



@Component({
  selector: 'app-textfield',
  templateUrl: './textfield.component.html',
  styleUrls: ['./textfield.component.css']
})


export class TextfieldComponent {
  inputValue: string = ''; // Questa variabile conterrà il valore inserito nell'input
  @Input() placeholder: string = '';

  // Puoi aggiungere ulteriori logica o funzioni qui, se necessario
}
