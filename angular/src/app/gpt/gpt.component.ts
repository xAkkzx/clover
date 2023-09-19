import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2,
} from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CustomToastrService } from "../custom-toastr.service";
import { GlobalService } from "../global.service";
import { TextfieldComponent } from "../textfield/textfield.component";
import { timestamp } from "rxjs";

@Component({
  selector: "app-gpt",
  templateUrl: "./gpt.component.html",
  styleUrls: ["./gpt.component.css", "../textfield/textfield.component.css"],
})
export class GptComponent implements AfterViewInit {
  formControls = new FormGroup({
    option1: new FormControl("", [
      /* Validators if needed */
    ]),
  });
  token: string;
  @ViewChild(TextfieldComponent, { static: false })
  textfieldRic!: TextfieldComponent;
  chatMessages: { text: string; type: string }[] = [];
  isRequestEmpty: boolean = false;

  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  loggedInUsername: string = this.globalService.getGlbUsr();

  azione: string = "";
  selectedDb: string = ""; // Inizializzala con un valore vuoto
  getJsonValue: any;
  currentSessionMessages: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.token = globalService.getGlobalVariable();
    this.token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im0iLCJpYXQiOjE2OTUxMjQ5OTgsImV4cCI6MTY5NTEzMjE5OH0.g2uHNEn_O_P_m3hrw7GXvvooMufp1XmeO9tBnZQYoHc";
  }
  @ViewChild("chatContainer") private chatContainer!: ElementRef;

  ngOnInit() {
    if (this.loggedInUsername === "") {
      this.toastr.error("Devi accedere", "Error", {
        positionClass: "toast-bottom-right",
      });
    } else {
      const requestBody = {
        username: this.loggedInUsername,
      };

      const headers = new HttpHeaders({
        "Content-Type": "application/json",
      });

      const requestBodyJSON = JSON.stringify(requestBody);

      interface ApiResponse {
        userId: number;
        // Altri campi se presenti nella risposta
      }

      this.http
        .post<ApiResponse>("http://localhost:3000/uid", requestBodyJSON, {
          headers: headers,
          observe: "response",
        })
        .subscribe((response) => {
          console.log(response.status);

          if (response.status === 200) {
            console.log("Messaggio di chat salvato con successo:", response);

            if (response.body) {
              console.log(response.body);
              const userId = response.body.userId;
              console.log("UserId:", userId);

              // Ora che hai ottenuto l'ID dell'utente, carica i messaggi
              this.loadMessages(userId);
            } else {
              console.error(
                "Il corpo della risposta non contiene dati validi."
              );
            }
          } else {
            if (response.status === 404 || response.status === 500) {
              console.error(
                "Errore durante il salvataggio del messaggio di chat:",
                response
              );
            }
          }
        });
    }
  }

  private loadMessages(userId: number) {
    // All'interno della funzione per caricare i messaggi
    this.http.post("http://localhost:3000/loadMessages", { userId }).subscribe({
      next: (response: any) => {
        console.log("Messaggi caricati con successo:", response);

        // Assume che la risposta sia un array di oggetti messaggio
        const messages: any[] = response;

        // Itera sui messaggi e aggiungili a chatMessages
        messages.forEach((message: any) => {
          console.log(message.mittente);
          if (message.mittente === "utente") {
            this.chatMessages.push({
              text: message.messaggio,
              type: "request",
            });
          } else {
            this.chatMessages.push({
              text: message.messaggio,
              type: "response",
            });
          }
        });

        // Ora chatMessages contiene tutti i messaggi caricati
      },
      error: (error: any) => {
        console.error("Errore durante il caricamento dei messaggi:", error);
        // Gestisci l'errore qui se necessario
      },
    });
  }

  ngAfterViewInit() {
    if (this.textfieldRic) {
      this.textfieldRic.resetValue();
    }
    if (this.chatContainer && this.chatContainer.nativeElement) {
      console.log("fattobene");
      const chatContainerElement = this.chatContainer.nativeElement;
      // Use chatContainerElement as needed
    }
  }

  onTextFieldKeyPress(event: KeyboardEvent, nomedb: any) {
    if (event.key === "Enter") {
      // Verifica se il tasto premuto è "Invio"
      if (this.textfieldRic.inputValue == "") {
        this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
      }
      console.log(nomedb);

      this.chat(nomedb, "1", this.getValue(this.textfieldRic.inputValue));
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

  public chat(nomeDbz: string, tipoDbz: any, richiestaz: any) {
    let res = "x";
    const timestamp = new Date().toISOString();
    let ndb = nomeDbz.toLocaleLowerCase();
    console.log(ndb);
    const headers = new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json", // Set the content type to JSON
      "x-access-token": this.token,
    });

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
    let currentLine = "";

    for (let i = 0; i < richiestaz.length; i++) {
      if (currentLine.length === maxLineLength) {
        // If the current line reaches the maximum length, add it to the lines array and start a new line
        lines.push(currentLine);
        currentLine = "";
      }
      currentLine += richiestaz[i];
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    const formattedRequest = lines.join("\n");
    this.chatMessages.push({ text: formattedRequest, type: "request" });
    this.currentSessionMessages.push({
      message: formattedRequest,
      role: "utente",
    });

    if (ndb === "database") {
      this.chatMessages.push({
        text: "Ricorda, devi prima selezionare il DataBase su cui agire.",
        type: "response",
      });

      if (this.textfieldRic.inputValue == "") {
        this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
      }

      setTimeout(() => {
        this.isRequestEmpty = false;
      }, 400);

      setTimeout(() => {
        this.scrollToBottom();
      });

      this.textfieldRic.cambia(true);

      setTimeout(() => {
        this.textfieldRic.cambia(false);
      }, 400);

      this.currentSessionMessages.push({
        message: "Ricorda, devi prima selezionare il DataBase su cui agire.",
        role: "ai",
      });

      return;
    } else {
      if (richiestaz == "") {
        this.chatMessages.push({
          text: "Non posso rispondere se non mi chiedi niente.",
          type: "response",
        });

        if (this.textfieldRic.inputValue == "") {
          this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
        }
        setTimeout(() => {
          this.isRequestEmpty = false;
        }, 400);

        setTimeout(() => {
          this.scrollToBottom();
        });

        this.textfieldRic.cambia(true);

        setTimeout(() => {
          this.textfieldRic.cambia(false);
        }, 400);

        this.currentSessionMessages.push({
          message: "Non posso rispondere se non mi chiedi niente.",
          role: "ai",
        });

        return;
      }
    }

    this.http
      .post("http://localhost:3000/chat", requestBodyJSON, {
        ...httpOptions,
        observe: "response",
      })
      .subscribe({
        next: (response) => {
          console.log(response);

          if (response.status === 200) {
            // this.toastr.success('Login effettuato', 'Benvenuto!', { positionClass: 'toast-bottom-right'});
            ///console.log(response.body);
            console.log("Risposta arrivata");
            if (typeof response.body === "object") {
              res = JSON.stringify(response.body);
            }
            // console.log(this.formatJSONToTable(res))
            console.log(response.body);
            console.log(this.formatResponseAsTable(response.body));
            res = this.formatResponseAsTable(response.body);
            console.log("AO\n" + res + "\nAO");
            //  this.tab(response.body);
            //  this.formatAndPrintResponse(response.body);

            this.chatMessages.push({
              text: res,
              type: "response",
            });

            this.currentSessionMessages.push({ message: res, role: "ai" });

            setTimeout(() => {
              console.log("A");
              this.scrollToBottom();
            });

            // this.router.navigate(['/', 'gpt']);
          }
        },
        error: (error) => {
          if (error.status === 405) {
            this.chatMessages.push({
              text: "Non è stato possibile eseguire la tua richiesta.",
              type: "response",
            });

            this.currentSessionMessages.push({
              message: "Non è stato possibile eseguire la tua richiesta.",
              role: "ai",
            });

            if (this.textfieldRic.inputValue == "") {
              this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
            }
            setTimeout(() => {
              this.isRequestEmpty = false;
            }, 400);

            setTimeout(() => {
              this.scrollToBottom();
            });

            this.textfieldRic.cambia(true);

            setTimeout(() => {
              this.textfieldRic.cambia(false);
            }, 400);
          }
          if (error.status === 500) {
            if (error.error.includes("Sign In")) {
              this.customToastrService.showErrorWithLink(
                error.error.replace("Sign In", ""),
                "Sign In",
                "http://localhost:4200/register"
              );
            } else {
              this.toastr.error(error.error, "Error", {
                positionClass: "toast-bottom-right",
              });
            }

            if (this.textfieldRic.inputValue == "") {
              this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
            }

            setTimeout(() => {
              this.isRequestEmpty = false;
            }, 400);

            this.chatMessages.push({
              text: "errore durante elaborazione messaggio.",
              type: "response",
            });

            this.currentSessionMessages.push({
              message: "errore durante elaborazione messaggio.",
              role: "ai",
            });

            setTimeout(() => {
              this.scrollToBottom();
            });

            this.textfieldRic.cambia(true);

            setTimeout(() => {
              this.textfieldRic.cambia(false);
            }, 400);
          }
          if (error.status === 401) {
            this.chatMessages.push({
              text: "Accesso non autorizzato.",
              type: "response",
            });

            this.currentSessionMessages.push({
              message: "Accesso non autorizzato.",
              role: "ai",
            });

            if (this.textfieldRic.inputValue == "") {
              this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
            }

            setTimeout(() => {
              this.isRequestEmpty = false;
            }, 400);

            setTimeout(() => {
              this.scrollToBottom();
            });

            this.textfieldRic.cambia(true);

            setTimeout(() => {
              this.textfieldRic.cambia(false);
            }, 400);

            this.customToastrService.showErrorWithLink(
              error.error.replace("Sign In", ""),
              "Sign In",
              "http://localhost:4200/login"
            );
          }

          console.log(error.status);
          console.error("Errore durante la richiesta:", error);
          // Puoi gestire gli errori di rete o altri errori qui
        },
      });
  }

  public esci() {

    if(this.loggedInUsername === ""){
      this.globalService.setGlobalVariable("");
      this.router.navigate(["/", "login"]);
      return;
    }

    console.log("AAAAIAAAAAAAAAA");

    const requestBody = {
      username: this.loggedInUsername,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    const requestBodyJSON = JSON.stringify(requestBody);

    interface ApiResponse {
      userId: number;
      // Altri campi se presenti nella risposta
    }
    console.log("AAAAIUUUUUUUUUA");
    this.http
      .post<ApiResponse>("http://localhost:3000/uid", requestBodyJSON, {
        headers: headers,
        observe: "response",
      })
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            console.log("Messaggio di chat salvato con successo:", response);

            if (response.body) {
              console.log(response.body);
              const userId = response.body.userId;
              console.log("UserId:", userId);

              // Chiamata alla funzione saveChatMessage dopo aver ottenuto l'ID dell'utente
              this.saveChatMessagesAndExit(userId);
            } else {
              console.error(
                "Il corpo della risposta non contiene dati validi."
              );
            }
          } else {
            if (response.status === 400 || response.status === 500) {
              console.error(
                "Errore durante il salvataggio del messaggio di chat:",
                response
              );
              // Aggiungi qui la logica per gestire l'errore, ad esempio mostrare un messaggio all'utente o eseguire altre azioni necessarie
            }
          }
        },
        error: (error) => {
          console.error("Errore durante la richiesta HTTP:", error);
          // Gestisci l'errore qui se necessario, ad esempio mostrare un messaggio all'utente o eseguire altre azioni necessarie

        },
      });
  }

  private saveChatMessagesAndExit(userId: number) {
    // Chiamata alla funzione saveChatMessage prima di uscire
    this.currentSessionMessages.forEach((message) => {
      this.saveChatMessage(userId, message.role, message.message);
    });

    this.globalService.setGlobalVariable("");
    this.router.navigate(["/", "login"]);
  }

  public saveChatMessage(userId: number, role: string, messageText: string) {
    console.log("!!!!!!!!!!" + userId);
    const currentDate = new Date(); // Ottieni la data e l'ora correnti
    const formattedDate = currentDate.toISOString(); // Formatta la data e l'ora in una stringa ISO
    console.log(formattedDate);
    const requestBody = {
      userId: userId,
      role: role,
      message: messageText,
      timestamp: formattedDate, // Aggiungi il timestamp al messaggio
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.http
      .post("http://localhost:3000/save", requestBody, {
        headers: headers,
      })
      .subscribe({
        next: (response: any) => {
          console.log("Messaggio di chat salvato con successo:", response);
          // Puoi gestire la risposta dal server qui se necessario
        },
        error: (error: any) => {
          if (error.status === 406 || error.status === 500) {
            console.error(
              "Errore durante il salvataggio del messaggio di chat:",
              error
            );
          }

          // Puoi gestire gli errori qui se necessario
        },
      });
  }

  public pulisciChat() {
    this.chatMessages = [];
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

  private tab(dataObject: any) {
    // Initialize an empty string to store the table as a string
    let tableString = "";

    // Get the keys of the dataObject
    const keys = Object.keys(dataObject);

    // Iterate through the keys to dynamically generate headers and add rows
    keys.forEach((key) => {
      // Generate headers
      tableString += key + "\t";

      // Generate values for the current key
      const value = dataObject[key];
      tableString += value + "\t";
    });

    // Print the table
    console.log(tableString);
  }

  private formatAndPrintResponse(responseData: any): void {
    if (!responseData || responseData.length === 0) {
      console.log("Nessun dato presente nella risposta.");
    } else {
      responseData.forEach((object: any, index: any) => {
        const formattedObject = Object.keys(object)
          .map((key) => `${key}: ${object[key]}`)
          .join(", ");
        console.log(`${index}: ${formattedObject}`);
      });
    }
  }

  private formatResponseAsTable(responseBody: any): string {
    if (Array.isArray(responseBody) && responseBody.length === 1) {
      const pokemonData = responseBody[0] as { [key: string]: any }[];

      const columns = Object.keys(pokemonData[0]);
      const headerRow = `<tr>${columns
        .map((column) => `<th>${column}</th>`)
        .join("</th><th>")}</th>`;

      const dataRows = pokemonData.map((pokemon) => {
        const rowContent = columns
          .map((column) => `<td>${pokemon[column]}</td>`)
          .join("</td><td>");
        return `<tr>${rowContent}</td>`;
      });

      const tableString = `<table class="center-table">${headerRow}${dataRows.join(
        "</tr><tr>"
      )}</tr>`; // Aggiungi la classe "center-table" alla tabella

      return tableString;
    } else {
      return "";
    }
  }
}
