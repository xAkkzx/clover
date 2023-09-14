import { Component, EventEmitter, Output, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomToastrService } from '../custom-toastr.service';

@Component({
  selector: 'app-gpt',
  templateUrl: './gpt.component.html',
  styleUrls: ['./gpt.component.css'],
})
export class GptComponent implements AfterViewInit {
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
    private el: ElementRef
  ) {
  }

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  ngAfterViewInit() {
    // Access the nativeElement here
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

  public gptRes(nomeDb: string, richiesta: string) {

    console.log(nomeDb, richiesta);

    // Split the request into lines with a maximum length of 25 characters
    const maxLineLength = 45;
    const lines: string[] = [];
    let currentLine = '';

    for (let i = 0; i < richiesta.length; i++) {
      if (currentLine.length === maxLineLength) {
        // If the current line reaches the maximum length, add it to the lines array and start a new line
        lines.push(currentLine);
        currentLine = '';
      }
      currentLine += richiesta[i];
    }

    // Add the last line to the lines array if it's not empty
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Join the lines with '\n' to create the formatted request
    const formattedRequest = lines.join('\n');

    // Simulate a response (you can replace this with the actual response logic)
    const response = 'This is a simulated response for:\n' + formattedRequest;
    this.chatMessages.push({ text: formattedRequest, type: 'request' });
    this.chatMessages.push({ text: response, type: 'response' });

    // Scroll to the bottom of the chat container
    setTimeout(() => {
      console.log("A");
      this.scrollToBottom();
    });
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

