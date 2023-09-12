import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pulsante',
  templateUrl: './pulsante.component.html',
  styleUrls: ['./pulsante.component.css'],
})
export class PulsanteComponent {
  @Input() nome: string = '';
  @Input() pagina:string='';
  constructor(private router: Router) {}

  cambiaPagina() {
    this.router.navigate(['/',this.pagina]);
  }

}