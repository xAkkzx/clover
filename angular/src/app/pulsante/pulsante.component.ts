import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pulsante',
  templateUrl: './pulsante.component.html',
  styleUrls: ['./pulsante.component.css'],
  template: '<button (click)="eseguiAzione()">{{nome}}</button>',
})
export class PulsanteComponent {
  @Input() nome: string = '';
  @Input() pagina: string = '';
  @Input() azione: string = '';
  @Input() parametri: string = '';
  @Input() img:string='';

  public getJsonValue: any;
  public postJsonValue: any;

  constructor(private router: Router, private http: HttpClient,private toastr: ToastrService,) {}

  public eseguiAzione() {
    if(this.azione!='')
    {
      eval(`this.${this.azione}(${this.parametri})`);
    }
      
  }

  cambiaSVG(){
    if(this.img=="bi bi-eye-fill"){
      this.img="bi bi-eye-slash-fill ";
    }else{
      this.img="bi bi-eye-fill";
    }
  }

  niente(){
    this.toastr.warning('Funzione non ancora implementata','Attenzione', { positionClass: 'toast-bottom-right'});
  }


  cambiaPagina() {
    this.router.navigate(['/', this.pagina]);
  }

  public getMethod() {
    // Create an HttpHeaders object with the "Access-Control-Allow-Origin" header
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*'
    });
  
    // Define the options for the HTTP GET request, including the headers
    const httpOptions = {
      headers: headers
    };
    // Send the GET request with the specified headers
    this.http.get('http://localhost:3000/welcome', httpOptions).subscribe((data) => {
      console.log(data)
      this.getJsonValue = data
    });
  }

  public login() {
  // Create an HttpHeaders object with the "Access-Control-Allow-Origin" and "Content-Type" headers
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    });

    // Define the options for the HTTP GET request, including the headers
    const httpOptions = {
      headers: headers,
    };
    // Send the GET request with the specified headers
    this.http
      .get('http://localhost:3000/welcome', httpOptions)
      .subscribe((data) => {
        console.log(data);
        this.getJsonValue = data;
        // console.log("aia")
        // console.log(this.getJsonValue)
      });
  }
}
