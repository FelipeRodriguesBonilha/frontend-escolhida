import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ReturnProductDto } from '../../../core/models/products/return-product.interface';
import { BrlCurrencyPipe } from '../../../shared/pipes/brl-currency.pipe';
import type { CartItem } from '../sales';
import { EditPriceDialog } from '../edit-price-dialog/edit-price-dialog';

export interface CartDialogState {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface CartDialogData extends CartDialogState {
  displayedColumns: string[];
  getProductImageUrl: (product: ReturnProductDto) => string;
  updateQuantity: (index: number, quantity: number) => CartDialogState;
  updateUnitPrice: (index: number, unitPrice: number | null) => CartDialogState;
  removeFromCart: (index: number) => CartDialogState;
  clearCart: () => CartDialogState;
}

@Component({
  selector: 'app-cart-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
    BrlCurrencyPipe
  ],
  templateUrl: './cart-dialog.html',
  styleUrl: './cart-dialog.scss',
})
export class CartDialog {
  constructor(
    private dialogRef: MatDialogRef<CartDialog>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: CartDialogData
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  updateQuantity(index: number, quantity: number): void {
    this.syncState(this.data.updateQuantity(index, quantity));
  }

  editUnitPrice(index: number): void {
    const item = this.data.cartItems[index];
    const dialogRef = this.dialog.open(EditPriceDialog, {
      width: '480px',
      data: {
        productName: item.product.name,
        currentPrice: this.getUnitPrice(item),
        productPrice: item.product.effectivePrice,
        hasCustomPrice: item.unitPrice !== undefined,
      },
    });

    dialogRef.afterClosed().subscribe((unitPrice: number | null | undefined) => {
      if (unitPrice === undefined) return;
      this.syncState(this.data.updateUnitPrice(index, unitPrice));
    });
  }

  removeFromCart(index: number): void {
    this.syncState(this.data.removeFromCart(index));
  }

  clearCart(): void {
    this.syncState(this.data.clearCart());
  }

  getProductImageUrl(product: ReturnProductDto): string {
    return this.data.getProductImageUrl(product);
  }

  getUnitPrice(item: CartItem): number {
    return item.unitPrice ?? item.product.effectivePrice;
  }

  private syncState(state: CartDialogState): void {
    this.data.cartItems = state.cartItems;
    this.data.subtotal = state.subtotal;
    this.data.discount = state.discount;
    this.data.total = state.total;
  }
}
