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
  cambiacss=false;
  // Puoi aggiungere ulteriori logica o funzioni qui, se necessario
  
  resetValue(){
    this.inputValue = '';
  }

  cambia(v: boolean){

    this.cambiacss=v;

  }
}
