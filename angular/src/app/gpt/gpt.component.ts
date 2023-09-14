import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomToastrService } from '../custom-toastr.service';
import { GlobalService } from '../global.service';

@Component({
  selector: 'app-gpt',
  templateUrl: './gpt.component.html',
  styleUrls: ['./gpt.component.css']
})
export class GptComponent {
  token : string;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService
  ) {
    this.token = this.globalService.getGlobalVariable();
  }

  getValue(val: string) {
    return val;
  }

  public chat(nomeDbz : any, tipoDbz : any, richiestaz : any){

    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json', // Set the content type to JSON
      'x-access-token': this.token
    });

    const requestBody = {
      nomeDb : nomeDbz,
      tipoDb : tipoDbz,
      richiesta: richiestaz // Usa this.password per ottenere il valore dall'input
    };
    // Convert the requestBody object to a JSON string
    const requestBodyJSON = JSON.stringify(requestBody);

    const httpOptions = {
      headers: headers,
      body: requestBodyJSON, // Include the JSON request body here
    };

    this.http
      .post('http://localhost:3000/chat', requestBodyJSON, {
        ...httpOptions,
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          console.log(response);
          
          if (response.status === 200) {
            // this.toastr.success('Login effettuato', 'Benvenuto!', { positionClass: 'toast-bottom-right'});
            console.log('Risposta arrivata');
            // this.router.navigate(['/', 'gpt']);
          }
        },
        error: (error) => {
          if (error.status===500)
              if(error.error.includes('Sign In'))
              {
                this.customToastrService.showErrorWithLink(
                  error.error.replace("Sign In", ""),
                  'Sign In',
                  'http://localhost:4200/register'
                );
              }else{
                this.toastr.error(error.error, 'Error', { positionClass: 'toast-bottom-right'});
              }
          console.log(error.status);
          console.error('Errore durante la richiesta:', error);
          // Puoi gestire gli errori di rete o altri errori qui
        },
      });
  }
}
