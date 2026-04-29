import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { CashRegisterDto } from '../../../core/models/cash-register/cash-register.interface';
import { BrlCurrencyPipe } from '../../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-cash-register-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    BrlCurrencyPipe,
  ],
  templateUrl: './cash-register-details-dialog.html',
  styleUrl: './cash-register-details-dialog.scss',
})
export class CashRegisterDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<CashRegisterDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { cashRegister: CashRegisterDto }
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  get cr(): CashRegisterDto {
    return this.data.cashRegister;
  }
}
