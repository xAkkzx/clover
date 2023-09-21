import { Component,Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GlobalService } from "../global.service";

@Component({
  selector: 'app-database',
  templateUrl: './database.component.html',
  styleUrls: ['./database.component.css']
})
export class DatabaseComponent {
  @Input() nome:string ='';
  @Input() items: string[] = [];
  cambiacss=false;
  token: string;

  constructor(private http: HttpClient,
    private globalService: GlobalService,) { 
    this.token = globalService.getGlobalVariable();
  }

  ngOnInit(): void {
    this.fetchFileNames();
  }
  ngAfterViewInit(): void {
    this.fetchFileNames();
  }

  update(): void{
    console.log("falz g");
    this.fetchFileNames();
  }

  onMenuItemClick(item: string): void {
    this.nome= item;
    console.log(`Hai cliccato su: ${item}`);
  }

  change(v: boolean){
    this.cambiacss=v; 
  }

  fetchFileNames(): void {
    // Replace 'your-api-url-here' with the actual API URL
    const apiUrl = 'http://localhost:3000/dbz';

    const headers = new HttpHeaders({
        "Access-Control-Allow-Origin": "*",
        // 'Content-Type': 'application/json', // Set the content type to JSON
        "x-access-token": this.token,
      });

    this.http.get<{ fileNames: string[] }>(apiUrl, { headers })
      .pipe(
        map((data) => data.fileNames),
        catchError((error) => {
          console.error('Error:', error);
          return throwError(error);
        })
      )
      .subscribe(
        (fileNames) => {
          this.items = fileNames;
          console.log('File Names:', this.items);
        }
      );
  }

}
