import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ReturnProductDto, ReturnProductColorDto } from '../../core/models';
import { CatalogCategory, CatalogService } from '../../core/services/catalog/catalog.service';
import { ProductDetailDialog } from './product-detail-dialog/product-detail-dialog';

export interface CartItem {
  product: ReturnProductDto;
  quantity: number;
  selectedColor: ReturnProductColorDto | null;
}

@Component({
  selector: 'app-catalog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  products: ReturnProductDto[] = [];
  categories: CatalogCategory[] = [];
  cart: CartItem[] = [];

  searchQuery = '';
  selectedCategoryId = '';
  isLoading = false;
  showCart = false;

  currentPage = 1;
  pageSize = 12;
  total = 0;

  searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private catalogService: CatalogService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.catalogService
      .getProducts(
        this.currentPage,
        this.pageSize,
        this.searchQuery || undefined,
        this.selectedCategoryId || undefined,
      )
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.total = res.total;
          this.isLoading = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadProducts();
    }, 400);
  }

  selectCategory(id: string): void {
    this.selectedCategoryId = id;
    this.currentPage = 1;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  getImageUrl(product: ReturnProductDto): string {
    if (product.imageUrl) return this.catalogService.getPublicImageUrl(product.imageUrl);
    return '';
  }

  openDetail(product: ReturnProductDto): void {
    this.dialog.open(ProductDetailDialog, {
      width: '860px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'product-detail-dialog',
      data: {
        product,
        onAddToCart: (quantity: number, color: ReturnProductColorDto | null) => {
          const key = this.getCartKey(product.id, color?.id ?? null);
          const existing = this.cart.find(item => 
            this.getCartKey(item.product.id, item.selectedColor?.id ?? null) === key
          );
          if (existing) {
            existing.quantity += quantity;
          } else {
            this.cart.push({
              product,
              quantity,
              selectedColor: color,
            });
          }
          this.showCart = true;
        },
      },
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showCart) this.showCart = false;
  }

  getCartKey(productId: string, colorId: string | null): string {
    return colorId ? `${productId}-${colorId}` : productId;
  }

  getCartQuantity(product: ReturnProductDto): number {
    return this.cart
      .filter(i => i.product.id === product.id)
      .reduce((sum, i) => sum + i.quantity, 0);
  }

  addToCart(product: ReturnProductDto, event?: Event): void {
    event?.stopPropagation();
    const key = this.getCartKey(product.id, null);
    const existing = this.cart.find(i => 
      i.product.id === product.id && i.selectedColor === null
    );
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        product,
        quantity: 1,
        selectedColor: null,
      });
    }
  }

  removeFromCart(product: ReturnProductDto, event?: Event): void {
    event?.stopPropagation();
    const existing = this.cart.find(i => i.product.id === product.id);
    if (!existing) return;
    if (existing.quantity > 1) {
      existing.quantity--;
    } else {
      this.cart = this.cart.filter(i => i !== existing);
    }
  }

  removeItemFromCart(productId: string, colorId?: string): void {
    const key = this.getCartKey(productId, colorId ?? null);
    this.cart = this.cart.filter(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) !== key);
  }

  incrementCartItem(item: CartItem): void {
    item.quantity++;
  }

  decrementCartItem(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItemFromCart(item.product.id, item.selectedColor?.id);
    }
  }

  updateQuantity(item: CartItem, value: number): void {
    if (value < 1) {
      this.removeItemFromCart(item.product.id, item.selectedColor?.id);
    } else {
      item.quantity = value;
    }
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  openWhatsApp(): void {
    if (this.cart.length === 0) return;

    const lines = this.cart.map(item => {
      const color = item.selectedColor ? ` (${item.selectedColor.name})` : '';
      return `• ${item.quantity}x ${item.product.name}${color} - ${this.formatCurrency(item.product.price * item.quantity)}`;
    });

    const total = this.formatCurrency(this.cartTotal);
    const text = `Olá! Tenho interesse nos seguintes produtos:\n\n${lines.join('\n')}\n\n*Total: ${total}*\n\nPoderia me ajudar?`;
    window.open(`https://wa.me/5514998198164?text=${encodeURIComponent(text)}`, '_blank');
  }
}
