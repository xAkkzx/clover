import { HttpClient, HttpHeaders  } from '@angular/common/http';
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

  public getJsonValue: any;
  public postJsonValue: any;

  constructor(private router: Router, private http: HttpClient) {}

  cambiaPagina() {
    this.router.navigate(['/',this.pagina]);
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
      // console.log("aia")
      // console.log(this.getJsonValue)
    });
  }

  public login() {
  // Create an HttpHeaders object with the "Access-Control-Allow-Origin" and "Content-Type" headers
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json' // Set the content type to JSON
    });

    // Define the data to be sent in the request body
    const requestBody = {
      "username": 'admin',
      "password": 'admin'
    };

    // Convert the requestBody object to a JSON string
    const requestBodyJSON = JSON.stringify(requestBody);

    // Define the options for the HTTP POST request, including the headers and the body
    const httpOptions = {
      headers: headers,
      body: requestBodyJSON // Include the JSON request body here
    };

    this.http.post('http://localhost:3000/login', requestBodyJSON, httpOptions).subscribe((data) => {
    console.log(data);
    this.getJsonValue = data;
    });

  }
}