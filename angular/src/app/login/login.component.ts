import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  username: string = 'm'; // Dichiarazione di variabili al di fuori della funzione
  password: string = 'z'; // Dichiarazione di variabili al di fuori della funzione
  azione: string = '';
  getJsonValue: any;

  constructor(private router: Router, private http: HttpClient) {}

  public eseguiAzione() {
    eval(`this.${this.azione}()`);
  }

  getValue(val: string) {
    return val;
  }

  public login(usr: string, psw: string) {
    // Create an HttpHeaders object with the "Access-Control-Allow-Origin" and "Content-Type" headers
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json', // Set the content type to JSON
    });

    // Define the data to be sent in the request body
    const requestBody = {
      username: usr, // Usa this.username per ottenere il valore dall'input
      password: psw, // Usa this.password per ottenere il valore dall'input
    };

    //console.warn(this.username)

    // Convert the requestBody object to a JSON string
    const requestBodyJSON = JSON.stringify(requestBody);

    // Define the options for the HTTP POST request, including the headers and the body
    const httpOptions = {
      headers: headers,
      body: requestBodyJSON, // Include the JSON request body here
    };

    this.http
  .post('http://localhost:3000/login', requestBodyJSON, { ...httpOptions, observe: 'response' })
  .subscribe({
    next: (response) => {
      console.log(response);
      
      if (response.status === 200) {
        console.log('Ok - Login effettuato');
        this.router.navigate(['/', "gpt"])
      }
    },
    error: (error) => {
      console.error('Errore durante la richiesta:', error);
      // Puoi gestire gli errori di rete o altri errori qui
    }
  });

  }
}
