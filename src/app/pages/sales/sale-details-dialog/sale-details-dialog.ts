import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ReturnSaleDto } from '../../../core/models';

@Component({
  selector: 'app-sale-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './sale-details-dialog.html',
  styleUrl: './sale-details-dialog.scss',
})
export class SaleDetailsDialog {
  constructor(
    public dialogRef: MatDialogRef<SaleDetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { sale: ReturnSaleDto }
  ) { }

  close(): void {
    this.dialogRef.close();
  }
}
