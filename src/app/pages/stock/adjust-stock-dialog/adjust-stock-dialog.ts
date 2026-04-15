import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReturnProductDto, ReturnStockDto } from '../../../core/models';
import { StockService } from '../../../core/services/stock/stock';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-adjust-stock-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './adjust-stock-dialog.html',
  styleUrl: './adjust-stock-dialog.scss'
})
export class AdjustStockDialog {
  adjustForm: FormGroup;
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { stock: ReturnStockDto; product: ReturnProductDto },
    private dialogRef: MatDialogRef<AdjustStockDialog>,
    private fb: FormBuilder,
    private stockService: StockService,
    private toastService: ToastService
  ) {
    this.adjustForm = this.fb.group({
      quantity: [data.stock.quantity, [Validators.required, Validators.min(0)]],
      minQuantity: [data.stock.minQuantity, [Validators.required, Validators.min(0)]]
    });
  }

  increaseQuantity(): void {
    const currentValue = this.adjustForm.get('quantity')?.value || 0;
    this.adjustForm.patchValue({ quantity: currentValue + 1 });
  }

  decreaseQuantity(): void {
    const currentValue = this.adjustForm.get('quantity')?.value || 0;
    if (currentValue > 0) {
      this.adjustForm.patchValue({ quantity: currentValue - 1 });
    }
  }

  onSubmit(): void {
    if (this.adjustForm.invalid) return;

    this.isLoading = true;
    const formValue = this.adjustForm.value;

    this.stockService.adjustStock(this.data.stock.productId, {
      quantity: formValue.quantity,
      minQuantity: formValue.minQuantity
    }).subscribe({
      next: () => {
        this.toastService.success('Estoque ajustado com sucesso!');
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error adjusting stock:', error);
        const errorMessage = error?.error?.message || 'Erro ao ajustar estoque. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
