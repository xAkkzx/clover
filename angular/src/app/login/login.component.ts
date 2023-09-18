import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomToastrService } from '../custom-toastr.service';
import { GlobalService } from '../global.service';
import { TextfieldComponent } from '../textfield/textfield.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  username: string = ''; // Dichiarazione di variabili al di fuori della funzione
  password: string = ''; // Dichiarazione di variabili al di fuori della funzione
  azione: string = '';
  passwordFieldType: string = 'password'; // Inizialmente impostato su 'password'

  passwordVisible: boolean = false;
  getJsonValue: any;
  @ViewChild('textfieldpsw', { static: false })
textfieldRic!: TextfieldComponent;

  

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
    if (event.key === 'Enter') {
      // Verifica se il tasto premuto è "Invio"
      this.login(usr, psw);
    }
  }

  onPasswordInput(event: any) {
    const passwordInput = event.target;
    console.log(passwordInput.value.slice(-1));
    this.password = this.password + passwordInput.value.slice(-1);
    if (!this.passwordVisible) {
      const maskedPassword = '•'.repeat(passwordInput.value.length);
      passwordInput.value = maskedPassword;
    }
  }

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'text' ? 'password' : 'text';
    console.log(this.passwordFieldType);
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
      .post('http://localhost:3000/login', requestBodyJSON, {
        ...httpOptions,
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          console.log(response);

          if (response.status === 200) {
            this.toastr.success('Login effettuato', 'Benvenuto!', {
              positionClass: 'toast-bottom-right',
            });
            console.log('Ok - Login effettuato');
            let token = this.extractTokenFromResponse(response);
            this.globalService.setGlobalVariable(token);
            this.router.navigate(['/', 'gpt']);
          }
        },
        error: (error) => {
          if (error.status === 401)
            if (error.error.includes('Sign In')) {
              this.customToastrService.showErrorWithLink(
                error.error.replace('Sign In', ''),
                'Sign In',
                'http://localhost:4200/register'
              );
            } else {
              this.toastr.error(error.error, 'Error', {
                positionClass: 'toast-bottom-right',
              });
            }
          console.log(error.status);
          console.error('Errore durante la richiesta:', error);
          // Puoi gestire gli errori di rete o altri errori qui
        },
      });
  }
}
