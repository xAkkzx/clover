// global.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  private globalVariable: any; // Define your global variable here

  setGlobalVariable(value: any): void {
    this.globalVariable = value;
  }

  getGlobalVariable(): any {
    return this.globalVariable;
  }
}
