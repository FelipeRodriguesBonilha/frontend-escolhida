import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ReturnProductDto } from '../../../core/models/products/return-product.interface';
import { BrlCurrencyPipe } from '../../../shared/pipes/brl-currency.pipe';
import type { CartItem } from '../sales';

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
    @Inject(MAT_DIALOG_DATA) public data: CartDialogData
  ) { }

  close(): void {
    this.dialogRef.close();
  }

  updateQuantity(index: number, quantity: number): void {
    this.syncState(this.data.updateQuantity(index, quantity));
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

  private syncState(state: CartDialogState): void {
    this.data.cartItems = state.cartItems;
    this.data.subtotal = state.subtotal;
    this.data.discount = state.discount;
    this.data.total = state.total;
  }
}
