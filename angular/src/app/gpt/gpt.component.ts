import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Renderer2,
  HostListener,
} from "@angular/core";
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CustomToastrService } from "../custom-toastr.service";
import { GlobalService } from "../global.service";
import { TextfieldComponent } from "../textfield/textfield.component";
import { timestamp } from "rxjs";
import { DatabaseComponent } from "../database/database.component";
import { map, catchError, throwError } from "rxjs";

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
  @ViewChild(TextfieldComponent, { static: false }) textfieldRic!: TextfieldComponent;
  menudata!: DatabaseComponent;
  chatMessages: { text: string; type: string, isTypingAnimation: boolean}[] = [];
  isRequestEmpty: boolean = false;
  @ViewChild(DatabaseComponent, { static: false }) databaseComponent!: DatabaseComponent;
  @ViewChild('fileInputz', { static: false }) fileInput!: ElementRef;

  @Output() loginClicked: EventEmitter<void> = new EventEmitter<void>();

  loggedInUsername: string = this.globalService.getGlbUsr();

  azione: string = "";
  selectedDb: string = ""; // Inizializzala con un valore vuoto
  getJsonValue: any;
  selectedFile: File | null = null;
  currentSessionMessages: any[] = [];
 // f:any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private customToastrService: CustomToastrService,
    private globalService: GlobalService,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    window.addEventListener("popstate", this.onPopState.bind(this));
    window.addEventListener("beforeunload", this.onBeforeUnload.bind(this));
    this.token = globalService.getGlobalVariable();
    // this.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImEiLCJpYXQiOjE2OTUxOTUxMDEsImV4cCI6MTY5NTIwMjMwMX0.lXF6hLseM9XKEBY67iTclBwtWPG-1GonGldJZDfbRAM';
  }
  @ViewChild("chatContainer") private chatContainer!: ElementRef;

  // Modify the onBeforeUnload method to call esci() when the window is closed
  onBeforeUnload(event: BeforeUnloadEvent) {
    this.esci();
    // Optionally, you can return a custom message to prompt the user
    event.returnValue = "Are you sure you want to leave this page?";
  }

  // Call the update function in GptComponent
  callUpdateFunctionInDatabaseComponent() {
    this.databaseComponent.restoreName();
    this.databaseComponent.update();
  }


  // Define the popstate event handler
  onPopState(event: PopStateEvent) {
    // Call the esci() method when the user navigates backward or forward
    this.esci();
  }

  resetFileInput(f: HTMLInputElement){
    f.value = '';
  }

  ngOnInit() {
    if (this.loggedInUsername === "") {
      this.toastr.error("Devi accedere", "Error", {
        positionClass: "toast-bottom-right",
      });
    } else {
      this.getId().subscribe((userId: any) => {
        console.log("UserID:", userId);
        console.log("arrivederci" + userId);
        this.loadMessages(userId);
        // Esegui altre azioni qui con l'ID dell'utente
      });
    }
  }

  private loadMessages(userId: number) {
    // All'interno della funzione per caricare i messaggi
    console.log("ciao" + userId);
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
              isTypingAnimation: false, // Imposta questa proprietà per attivare l'animazione
            });
          } else {
            this.chatMessages.push({
              text: message.messaggio,
              type: "response",
              isTypingAnimation: false, // Aggiungi questa proprietà per attivare l'animazione
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

  elimina(Dbz: any){
    let ndb = Dbz.nome.toLocaleLowerCase();
    console.log(ndb);
    let errorz = "Remember to select the Database";
    if(ndb === "database"){
      this.toastr.error(errorz, "Error", {
        positionClass: "toast-bottom-right",
      });
    }

    const headers = new HttpHeaders({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json", // Set the content type to JSON
      "x-access-token": this.token,
    });

    const requestBody = {
      nomeDb: ndb // Usa this.password per ottenere il valore dall'input
    };

    const requestBodyJSON = JSON.stringify(requestBody);

    const httpOptions = {
      headers: headers,
      body: requestBodyJSON, // Include the JSON request body here
    };

    this.http.post("http://localhost:3000/delete", requestBodyJSON, {
      ...httpOptions,
      observe: "response",
    })
    .subscribe({
      next: (response) =>{
        if(response.status === 200){
          this.toastr.success("", "File deleted succesfully!", {
              positionClass: "toast-bottom-right",
          });
          this.callUpdateFunctionInDatabaseComponent()
        }
      },
      error: (error) =>{
        if(error.status === 404){
          this.toastr.error("", "The database you tried to remove does not exist.", {
            positionClass: "toast-bottom-right",
          });
        }
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

  }
  uploadFile(f: HTMLInputElement): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append("file", this.selectedFile);
      const headers = new HttpHeaders({
        "Access-Control-Allow-Origin": "*",
        "x-access-token": this.token,
      });
      const httpOptions = {
        headers: headers,
      };
      let res = "x";
      this.http
        .post("http://localhost:3000/upload", formData, {
          ...httpOptions,
          observe: "response",
        })
        .subscribe({
          next: (response) => {
            // console.log(response+"a");
            if (response.status === 200) {
              console.log("File caricato correttamente");
              // if (typeof response.body === "object") {
              //   res = JSON.stringify(response.body);
              // }
              this.toastr.success("", "File uploaded succesfully!", {
                positionClass: "toast-bottom-right",
              });
              console.log(response.body);
              this.callUpdateFunctionInDatabaseComponent()
            }
            this.resetFileInput(f);
          },
          error: (error) => {
            if (error.status === 405) {
              this.toastr.error("No files were uploaded", "Error", {
                positionClass: "toast-bottom-right",
              });
              console.log(error.status);
              console.error(error);
            }
            if (error.status === 400) {
              this.toastr.error("Error uploading the file", "Error", {
                positionClass: "toast-bottom-right",
              });
              console.log(error.status);
              console.error(error);
            }
            if (error.status === 401) {
              this.toastr.error("Unauthorized access", "Error", {
                positionClass: "toast-bottom-right",
              });
              console.log(error.status);
              console.error(error);
              this.customToastrService.showErrorWithLink(
                error.error.replace("Sign In", ""),
                "Sign In",
                "http://localhost:4200/login"
              );
            
            if (error.status === 500) {
              this.toastr.error("Error uploading the file", "Error", {
                positionClass: "toast-bottom-right",
              });
              console.log(error.status);
              console.error(error);
            }
            
            // console.log(error.status +"a");
            // console.error('Errore durante la richiesta:', error);
            // Puoi gestire gli errori di rete o altri errori qui

          }
        }
        });
    }else{
      this.toastr.error("No files were uploaded", "Error", {
        positionClass: "toast-bottom-right",
      });
    }
  }

  onTextFieldKeyPress(event: KeyboardEvent, Dbz: any) {
    if (event.key === "Enter") {
      // Verifica se il tasto premuto è "Invio"
      if (this.textfieldRic.inputValue == "") {
        this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
      }
      //console.log(Dbz)

      this.chat(Dbz, "1", this.getValue(this.textfieldRic.inputValue));
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

  public chat(Dbz: any, tipoDbz: any, richiestaz: any) {
    let res = "x";
    this.menudata = Dbz;
    let ndb = Dbz.nome.toLocaleLowerCase();
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
    this.chatMessages.push({ text: formattedRequest, type: "request",  isTypingAnimation: false });
    this.currentSessionMessages.push({
      message: formattedRequest,
      role: "utente",
    });

    if (ndb === "database") {
      this.chatMessages.push({
        text: "Ricorda, devi prima selezionare il DataBase su cui agire.",
        type: "response",
        isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
      });

      setTimeout(() => {
        this.chatMessages[this.chatMessages.length - 1].isTypingAnimation = false;
      }, 1000); // Il timeout deve essere uguale alla durata dell'animazione

      if (this.textfieldRic.inputValue == "") {
        this.isRequestEmpty = true; // Imposta la variabile a true se la richiesta è vuota
      }

      setTimeout(() => {
        this.isRequestEmpty = false;
      }, 400);

      setTimeout(() => {
        this.scrollToBottom();
      });

      console.log(Dbz.nome);
      this.textfieldRic.cambia(true);

      setTimeout(() => {
        this.textfieldRic.cambia(false);
      }, 400);

      this.menudata.change(true);
      this.currentSessionMessages.push({
        message: "Ricorda, devi prima selezionare il DataBase su cui agire.",
        role: "ai",
      });

      setTimeout(() => {
        this.menudata.change(false);
      }, 400);

      return;
    } else {
      if (richiestaz == "") {
        this.chatMessages.push({
          text: "Non posso rispondere se non mi chiedi niente.",
          type: "response",
          isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
        });

        setTimeout(() => {
          this.chatMessages[this.chatMessages.length - 1].isTypingAnimation = false;
        }, 1000); // Il timeout deve essere uguale alla durata dell'animazione

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
            // console.log("AO\n" + res + "\nAO");
            //  this.tab(response.body);
            //  this.formatAndPrintResponse(response.body);

            this.chatMessages.push({
              text: res,
              type: "response",
              isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
            });

            setTimeout(() => {
              this.chatMessages[this.chatMessages.length - 1].isTypingAnimation = false;
            }, 1000); // Il timeout deve essere uguale alla durata dell'animazione

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
              isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
            });

            setTimeout(() => {
              this.chatMessages[this.chatMessages.length - 1].isTypingAnimation = false;
            }, 1000); // Il timeout deve essere uguale alla durata dell'animazione

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
              isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
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
              isTypingAnimation: true, // Aggiungi questa proprietà per attivare l'animazione
            });

            setTimeout(() => {
              this.chatMessages[this.chatMessages.length - 1].isTypingAnimation = false;
            }, 1000); // Il timeout deve essere uguale alla durata dell'animazione

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
    if (this.loggedInUsername === "") {
      this.globalService.setGlobalVariable("");
      this.router.navigate(["/", "login"]);
      return;
    }

    console.log("AAAAIAAAAAAAAAA");

    this.getId().subscribe((userId: any) => {
      console.log("UserID:", userId);
      this.saveChatMessagesAndExit(userId);
      // Esegui altre azioni qui con l'ID dell'utente
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
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " "); //  Formatta la data e l'ora in una stringa ISO
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
    this.currentSessionMessages = [];
    this.chatMessages = [];
    this.getId().subscribe((userId: any) => {
      console.log("UserID:", userId);
      this.clearChat(userId);
      // Esegui altre azioni qui con l'ID dell'utente
    });
  }



  public clearChat(userId: number) {
    console.log("!!!!!!!!!!" + userId);
    const requestBody = {
      userId: userId,
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    this.http
      .post("http://localhost:3000/clear", requestBody, {
        headers: headers,
      })
      .subscribe({
        next: (response: any) => {
          console.log("Chat cancellata con successo:", response);
          // Puoi gestire la risposta dal server qui se necessario
        },
        error: (error: any) => {
          if (error.status === 500) {
            console.error(
              "Errore durante il cancellamento del messaggio di chat:",
              error
            );
          }
        },
      });
  }




  public getId(): Observable<number> {
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
  
    return this.http.post<ApiResponse>("http://localhost:3000/uid", requestBodyJSON, {
      headers: headers,
      observe: "response",
    }).pipe(
      map(response => {
        if (response.body && response.body.userId) {
          return response.body.userId;
        } else {
          throw new Error('User ID not found in response body');
        }
      }),
      catchError(error => {
        console.error("Errore durante il recupero dell'ID:", error);
        return throwError("Errore durante il recupero dell'ID");
      })
    );
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
