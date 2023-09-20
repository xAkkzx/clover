import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomToastrService } from '../custom-toastr.service';
import { GlobalService } from '../global.service';
import { TextfieldComponent } from "../textfield/textfield.component";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  template: '',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  username: string = 'm'; // Dichiarazione di variabili al di fuori della funzione
  password: string = 'z'; // Dichiarazione di variabili al di fuori della funzione
  azione: string = '';
  passwordFieldType: string = 'password'; // Inizialmente impostato su 'password'
  getJsonValue: any;
  @ViewChild("textfieldpsw", { static: false })
  textfieldRic!: TextfieldComponent;
  @ViewChild("textfield", { static: false })
  textfieldUsr!: TextfieldComponent;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService,
    private el: ElementRef
  ) {}

  public eseguiAzione() {
    eval(`this.${this.azione}()`);
  }

  getValue(val: string) {
    return val;
  }

  extractTokenFromResponse(response: any): string | null {
    if (response && response.body && response.body.token) {
      return response.body.token;
    } else {
      return null;
    }
  }

  onTextFieldKeyPress(event: KeyboardEvent, usr: any, psw: any) {
    if (event.key === 'Enter') { // Verifica se il tasto premuto è "Invio"
      this.registra(usr, psw);
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'text' ? 'password' : 'text';
    console.log(this.passwordFieldType);
  }

  public registra(usr: string, psw: string) {


    if (psw === "") {
      this.textfieldRic.cambia(true);

      setTimeout(() => {
        this.textfieldRic.cambia(false);
      }, 400);
    }

    if (usr === "") {
      this.textfieldUsr.cambia(true);

      setTimeout(() => {
        this.textfieldUsr.cambia(false);
      }, 400);
    }



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
      .post('http://localhost:3000/register', requestBodyJSON, {
        ...httpOptions,
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          console.log(response);

          if (response.status === 201) {
            this.globalService.setGlbUsr(usr);
            this.toastr.success('Registrazione effettuata', 'Benvenuto!', { positionClass: 'toast-bottom-right'} );
            console.log('Ok - Registrazione effettuata');
            let token = this.extractTokenFromResponse(response)
            this.globalService.setGlobalVariable(token);
            this.router.navigate(['/', 'gpt']);
          }
        },
        error: (error) => {
          if (error.status === 400)
            this.toastr.error(error.error, 'Error', { positionClass: 'toast-bottom-right'});
          else{
            if(error.status === 409){

              this.textfieldUsr.cambia(true);

              setTimeout(() => {
                this.textfieldUsr.cambia(false);
              }, 400);

              
              this.customToastrService.showWarningWithLink(
                error.error.replace("Login", ""),
                'Login',
                'http://localhost:4200/register'
              );
            }
          }
          console.log(error.status);
          console.error('Errore durante la richiesta:', error);
          // Puoi gestire gli errori di rete o altri errori qui
        },
      });
  }
}
