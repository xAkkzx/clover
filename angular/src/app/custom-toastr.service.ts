import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class CustomToastrService {
  constructor(private toastr: ToastrService) {}

  showSuccessWithLink(message: string, linkText: string, linkUrl: string) {
    const messageWithLink = `${message} <a href="${linkUrl}" target="_blank">${linkText}</a>`;
    this.toastr.success(messageWithLink, 'Success', {
      enableHtml: true, // Enable HTML content in toastr message
    });
  }

  showErrorWithLink(errorMessage: string, linkText: string, linkUrl: string) {
    const messageWithLink = `${errorMessage} <a href="${linkUrl}" target="_blank">${linkText}</a>`;
    this.toastr.error(messageWithLink, 'Errore', {
      enableHtml: true, // Enable HTML content in toastr message
      positionClass: 'toast-bottom-right', // You can specify the position here
    });
  }

  showWarningWithLink(errorMessage: string, linkText: string, linkUrl: string) {
    const messageWithLink = `${errorMessage} <a href="${linkUrl}" target="_blank">${linkText}</a>`;
    this.toastr.warning(messageWithLink, 'Warning', {
      enableHtml: true, // Enable HTML content in toastr message
      positionClass: 'toast-bottom-right', // You can specify the position here
    });
  }
}
