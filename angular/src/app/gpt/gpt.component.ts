import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomToastrService } from '../custom-toastr.service';
import { GlobalService } from '../global.service';
import { TextfieldComponent } from '../textfield/textfield.component';

@Component({
  selector: 'app-gpt',
  templateUrl: './gpt.component.html',
  styleUrls: ['./gpt.component.css']
})
export class GptComponent implements AfterViewInit{
  token : string;
  @ViewChild(TextfieldComponent, { static: false }) textfieldRic!: TextfieldComponent;
  chatMessages: { text: string; type: string }[] = [];
  
  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  username: string = 'm'; // Dichiarazione di variabili al di fuori della funzione
  password: string = 'z'; // Dichiarazione di variabili al di fuori della funzione
  azione: string = '';
  getJsonValue: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService,
    private el: ElementRef
  ) {
    this.token = this.globalService.getGlobalVariable();
  }
   @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngAfterViewInit() {
    if (this.textfieldRic) {
      this.textfieldRic.resetValue();
    }
    if (this.chatContainer && this.chatContainer.nativeElement) {
      console.log("aa");
      const chatContainerElement = this.chatContainer.nativeElement;
      // Use chatContainerElement as needed
    }else{
      console.log("suca")
    }
  }

  public eseguiAzione() {
    eval(`this.${this.azione}()`);
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

    this.ngAfterViewInit();
    const maxLineLength = 45;
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < richiestaz.length; i++) {
      if (currentLine.length === maxLineLength) {
        // If the current line reaches the maximum length, add it to the lines array and start a new line
        lines.push(currentLine);
        currentLine = '';
      }
      currentLine += richiestaz[i];
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    const formattedRequest = lines.join('\n');
    const response = 'This is a simulated response for:\n' + formattedRequest;
    this.chatMessages.push({ text: formattedRequest, type: 'request' });
    this.chatMessages.push({ text: response, type: 'response' });
    setTimeout(() => {
      console.log("A");
      this.scrollToBottom();
    });

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
          if(error.status === 401)
          {
            this.customToastrService.showErrorWithLink(
                  error.error.replace("Sign In", ""),
                  'Sign In',
                  'http://localhost:4200/login'
                );
          }
            
          console.log(error.status);
          console.error('Errore durante la richiesta:', error);
          // Puoi gestire gli errori di rete o altri errori qui
        },
      });
  }

  public esci()
  {
    this.globalService.setGlobalVariable("");
    this.router.navigate(['/', 'login']);
  }
  private scrollToBottom() {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        console.log("chatContainer and nativeElement exist");
        const chatContainerElement = this.chatContainer.nativeElement;
        console.log("chatContainerElement:", chatContainerElement);
        chatContainerElement.scrollTop = chatContainerElement.scrollHeight;
      } else {
        console.log("chatContainer or nativeElement is missing");
      }
  }
}
