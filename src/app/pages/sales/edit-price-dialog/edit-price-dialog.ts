import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NgxCurrencyDirective } from 'ngx-currency';
import { BrlCurrencyPipe } from '../../../shared/pipes/brl-currency.pipe';

export interface EditPriceDialogData {
  productName: string;
  currentPrice: number;
  productPrice: number;
  hasCustomPrice: boolean;
}

@Component({
  selector: 'app-edit-price-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgxCurrencyDirective,
    BrlCurrencyPipe,
  ],
  templateUrl: './edit-price-dialog.html',
})
export class EditPriceDialog {
  priceForm: FormGroup<{
    unitPrice: FormControl<number>;
  }>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPriceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: EditPriceDialogData,
  ) {
    this.priceForm = this.fb.nonNullable.group({
      unitPrice: [
        this.data.currentPrice,
        [Validators.required, Validators.min(0.01)],
      ],
    });
  }

  save(): void {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      return;
    }

    const unitPrice = Number(this.priceForm.controls.unitPrice.value);
    this.dialogRef.close(Math.round(unitPrice * 100) / 100);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  useProductPrice(): void {
    this.dialogRef.close(null);
  }
}
