// global.service.ts

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class GlobalService {
  private globalVariable: any = "a"; // Define your global variable here
  private glbusr: string = "";

  setGlobalVariable(value: any): void {
    this.globalVariable = value;
  }

  getGlobalVariable(): any {
    return this.globalVariable;
  }

  setGlbUsr(value: string) {
    this.glbusr = value;
  }

  getGlbUsr(): string {
    return this.glbusr;
  }
}
