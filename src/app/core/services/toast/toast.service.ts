import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration: number = 3000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['toast-success']
    };
    this.snackBar.open(message, 'Fechar', config);
  }

  error(message: string, duration: number = 5000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['toast-error']
    };
    this.snackBar.open(message, 'Fechar', config);
  }

  info(message: string, duration: number = 3000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['toast-info']
    };
    this.snackBar.open(message, 'Fechar', config);
  }

  warning(message: string, duration: number = 4000): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['toast-warning']
    };
    this.snackBar.open(message, 'Fechar', config);
  }
}
