import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ReturnProductDto, ReturnProductColorDto } from '../../../core/models';
import { CatalogService } from '../../../core/services/catalog/catalog.service';
import { CommonModule } from '@angular/common';

export interface ProductDetailDialogData {
  product: ReturnProductDto;
  onAddToCart: (quantity: number, color: ReturnProductColorDto | null) => void;
}

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  templateUrl: './product-detail-dialog.html',
  styleUrl: './product-detail-dialog.scss',
})
export class ProductDetailDialog {
  selectedColor: ReturnProductColorDto | null = null;
  quantity = 1;
  imageIndex = 0;
  images: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<ProductDetailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ProductDetailDialogData,
    private catalogService: CatalogService
  ) {
    this.selectedColor = null;
    this.images = this.buildImages();
  }

  private buildImages(): string[] {
    const imgs: string[] = [];
    const productImages = this.data.product.images ?? [];
    if (productImages.length > 0) {
      productImages.forEach(img => imgs.push(this.getImageUrl(img.url)));
    } else if (this.data.product.imageUrl) {
      imgs.push(this.getImageUrl(this.data.product.imageUrl));
    }
    (this.data.product.colors ?? []).forEach(c => {
      if (c.imageUrl) imgs.push(this.getImageUrl(c.imageUrl));
    });
    return imgs;
  }

  get canAddToCart(): boolean {
    if (this.data.product.colors && this.data.product.colors.length > 0) {
      return this.selectedColor !== null;
    }
    return true;
  }

  getImageUrl(imageUrl: string): string {
    return this.catalogService.getPublicImageUrl(imageUrl);
  }

  selectColor(color: ReturnProductColorDto): void {
    this.selectedColor = color;
    if (color.imageUrl) {
      const idx = this.images.indexOf(this.getImageUrl(color.imageUrl));
      if (idx >= 0) {
        this.imageIndex = idx;
      }
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  addToCart(): void {
    this.data.onAddToCart(this.quantity, this.selectedColor);
    this.dialogRef.close();
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
