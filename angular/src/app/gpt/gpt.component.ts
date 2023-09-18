import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
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
  styleUrls: ['./gpt.component.css', '../textfield/textfield.component.css'],
})
export class GptComponent implements AfterViewInit {
  formControls = new FormGroup({
    option1: new FormControl('', [/* Validators if needed */])
  });
  token: string;
  @ViewChild(TextfieldComponent, { static: false })
  textfieldRic!: TextfieldComponent;
  chatMessages: { text: string; type: string }[] = [];
  isRequestEmpty: boolean = false;

  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  username: string = 'm'; // Dichiarazione di variabili al di fuori della funzione
  password: string = 'z'; // Dichiarazione di variabili al di fuori della funzione
  azione: string = '';
  selectedDb: string = ''; // Inizializzala con un valore vuoto
  getJsonValue: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService,
    private el: ElementRef
  ) {
    this.token = globalService.getGlobalVariable();
    this.token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjk1MDIwNTg2LCJleHAiOjE2OTUwMjc3ODZ9.Zlc-ecL9jCAqS3GZfeOWuXOpbpF_Mf-X34miYT14WdU';
  }
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngAfterViewInit() {
    if (this.textfieldRic) {
      this.textfieldRic.resetValue();
    }
    if (this.chatContainer && this.chatContainer.nativeElement) {
      //console.log("aa");
      const chatContainerElement = this.chatContainer.nativeElement;
      // Use chatContainerElement as needed
    } else {
      //console.log("suca")
    }
  }


  onTextFieldKeyPress(event: KeyboardEvent, nomedb: any) {
    if (event.key === 'Enter') { // Verifica se il tasto premuto è "Invio"
      let a = this.textfieldRic.inputValue
      if(a === ''){
        this.isRequestEmpty = true;
        
      }
       // Imposta la variabile a true se la richiesta è vuota
      console.log(nomedb)
      this.chat(nomedb, '1', this.getValue(this.textfieldRic.inputValue));
      setTimeout(() => {
        this.isRequestEmpty = false;
      }, 400);
      return;
    }
  }


  public eseguiAzione() {
    eval(`this.${this.azione}()`);
  }

  getValue(val: string) {
    return val;
  }

  public chat(nomeDbz: any, tipoDbz: any, richiestaz: any) {
    console.log("suca")
    let res = 'x';

    let ndb = nomeDbz;
    console.log(ndb);
    const headers = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json', // Set the content type to JSON
      'x-access-token': this.token,
    });

    console.log("suca2")

    const requestBody = {
      nomeDb: ndb,
      tipoDb: tipoDbz,
      richiesta: richiestaz, // Usa this.password per ottenere il valore dall'input
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
    this.chatMessages.push({ text: formattedRequest, type: 'request' });

    if(ndb === "Database"){
      this.chatMessages.push({
        text: "Ricorda, devi prima selezionare il DataBase su cui agire.",
        type: 'response',
      });

      setTimeout(() => {
        this.scrollToBottom();
      });

      return;
    }else{
      if(richiestaz == ''){
        this.chatMessages.push({
          text: "Non posso rispondere se non mi chiedi niente.",
          type: 'response',
        });
        setTimeout(() => {
          this.scrollToBottom();
        });
        return; 
      }
    }


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
            ///console.log(response.body);
            console.log('Risposta arrivata');
            if (typeof response.body === 'object') {
              res = JSON.stringify(response.body);
            }
            // console.log(this.formatJSONToTable(res))
            console.log(response.body);
            console.log(this.formatResponseAsTable(response.body));
            res = this.formatResponseAsTable(response.body)
            console.log("AO\n" + res + "\nAO");
          //  this.tab(response.body);
          //  this.formatAndPrintResponse(response.body);

            this.chatMessages.push({
              text: res,
              type: 'response',
            });

            setTimeout(() => {
              console.log('A');
              this.scrollToBottom();
            });

            // this.router.navigate(['/', 'gpt']);
          }
        },
        error: (error) => {
          if (error.status === 405)
          {
            this.chatMessages.push({
              text: 'Non è stato possibile eseguire la tua richiesta.',
              type: 'response',
            })

            setTimeout(() => {
              this.scrollToBottom();
            });
          }
          if (error.status === 500)
          {
            // if (error.error.includes('Sign In')) {
            //   this.customToastrService.showErrorWithLink(
            //     error.error.replace('Sign In', ''),
            //     'Sign In',
            //     'http://localhost:4200/register'
            //   );
            // } else {
            //   this.toastr.error(error.error, 'Error', {
            //     positionClass: 'toast-bottom-right',
            //   });
            // }

            this.chatMessages.push({
              text: 'errore durante elaborazione messaggio',
              type: 'response',
            })

            setTimeout(() => {
              this.scrollToBottom();
            });
          }
          if (error.status === 401) {
            this.chatMessages.push({
              text: 'Accesso non autorizzato',
              type: 'response',
            })

            setTimeout(() => {
              this.scrollToBottom();
            });

            this.customToastrService.showErrorWithLink(
              error.error.replace('Sign In', ''),
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

  public esci() {
    this.globalService.setGlobalVariable('');
    this.router.navigate(['/', 'login']);
  }

  public pulisciChat() {
    this.chatMessages = [];
  }

  private scrollToBottom() {
    if (this.chatContainer && this.chatContainer.nativeElement) {
      console.log('chatContainer and nativeElement exist');
      const chatContainerElement = this.chatContainer.nativeElement;
      console.log('chatContainerElement:', chatContainerElement);
      chatContainerElement.scrollTop = chatContainerElement.scrollHeight;
    } else {
      console.log('chatContainer or nativeElement is missing');
    }
  }

  private tab(dataObject: any) {
    // Initialize an empty string to store the table as a string
    let tableString = '';
  
    // Get the keys of the dataObject
    const keys = Object.keys(dataObject);
  
    // Iterate through the keys to dynamically generate headers and add rows
    keys.forEach((key) => {
      // Generate headers
      tableString += key + '\t';
  
      // Generate values for the current key
      const value = dataObject[key];
      tableString += value + '\t';
    });
  
    // Print the table
    console.log(tableString);
  }

  private formatAndPrintResponse(responseData: any): void {
    if (!responseData || responseData.length === 0) {
      console.log('Nessun dato presente nella risposta.');
    } else {
      responseData.forEach((object:any, index:any) => {
        const formattedObject = Object.keys(object)
          .map((key) => `${key}: ${object[key]}`)
          .join(', ');
        console.log(`${index}: ${formattedObject}`);
      });
    }
  }

  private formatResponseAsTable(responseBody: any): string {
    if (Array.isArray(responseBody) && responseBody.length === 1) {
      const pokemonData = responseBody[0] as { [key: string]: any }[];
  
      const columns = Object.keys(pokemonData[0]);
      const headerRow = `<tr>${columns.map((column) => `<th>${column}</th>`).join('</th><th>')}</th>`;
      
      const dataRows = pokemonData.map((pokemon) => {
        const rowContent = columns.map((column) => `<td>${pokemon[column]}</td>`).join('</td><td>');
        return `<tr>${rowContent}</td>`;
      });
  
      const tableString = `<table class="center-table">${headerRow}${dataRows.join('</tr><tr>')}</tr>`; // Aggiungi la classe "center-table" alla tabella
  
      return tableString;
    } else {
      return '';
    }
  }


  
  
  
  
  
  
  
  
  
  
  
  
  
}
