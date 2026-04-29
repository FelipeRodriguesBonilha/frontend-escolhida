import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReturnProductDto, ReturnProductColorDto } from '../../core/models';
import { CatalogCategory, CatalogService } from '../../core/services/catalog/catalog.service';

export interface CartItem {
  product: ReturnProductDto;
  quantity: number;
  selectedColor: ReturnProductColorDto | null;
}

@Component({
  selector: 'app-catalog',
  imports: [FormsModule],
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

  selectedProduct: ReturnProductDto | null = null;
  modalColor: ReturnProductColorDto | null = null;
  modalQty = 1;
  modalImageIndex = 0;

  searchTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private catalogService: CatalogService) {}

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

  getColorImageUrl(color: ReturnProductColorDto): string {
    if (color.imageUrl) return this.catalogService.getPublicImageUrl(color.imageUrl);
    return '';
  }

  get modalImages(): string[] {
    if (!this.selectedProduct) return [];
    const imgs: string[] = [];
    if (this.selectedProduct.imageUrl) imgs.push(this.getImageUrl(this.selectedProduct));
    (this.selectedProduct.colors ?? []).forEach(c => {
      if (c.imageUrl) imgs.push(this.getColorImageUrl(c));
    });
    return imgs;
  }

  openDetail(product: ReturnProductDto): void {
    this.selectedProduct = product;
    this.modalColor = product.colors?.length ? product.colors[0] : null;
    this.modalQty = 1;
    this.modalImageIndex = 0;
    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.selectedProduct = null;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedProduct) this.closeDetail();
    if (this.showCart) this.showCart = false;
  }

  selectModalColor(color: ReturnProductColorDto): void {
    this.modalColor = color;
    if (color.imageUrl) {
      const idx = this.modalImages.indexOf(this.getColorImageUrl(color));
      if (idx >= 0) this.modalImageIndex = idx;
    }
  }

  getCartKey(productId: string, colorId: string | null): string {
    return colorId ? `${productId}-${colorId}` : productId;
  }

  addFromModal(): void {
    if (!this.selectedProduct) return;
    const key = this.getCartKey(this.selectedProduct.id, this.modalColor?.id ?? null);
    const existing = this.cart.find(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) === key);
    if (existing) {
      existing.quantity += this.modalQty;
      existing.selectedColor = this.modalColor;
    } else {
      this.cart.push({
        product: this.selectedProduct,
        quantity: this.modalQty,
        selectedColor: this.modalColor,
      });
    }
    this.closeDetail();
    this.showCart = true;
  }

  getCartQuantity(product: ReturnProductDto): number {
    const key = this.getCartKey(product.id, null);
    return this.cart.find(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) === key)?.quantity ?? 0;
  }

  addToCart(product: ReturnProductDto, event?: Event): void {
    event?.stopPropagation();
    const key = this.getCartKey(product.id, null);
    const existing = this.cart.find(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) === key);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        product,
        quantity: 1,
        selectedColor: product.colors?.length ? product.colors[0] : null,
      });
    }
  }

  removeFromCart(product: ReturnProductDto, event?: Event): void {
    event?.stopPropagation();
    const key = this.getCartKey(product.id, null);
    const existing = this.cart.find(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) === key);
    if (!existing) return;
    if (existing.quantity > 1) {
      existing.quantity--;
    } else {
      this.cart = this.cart.filter(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) !== key);
    }
  }

  removeItemFromCart(productId: string, colorId?: string): void {
    const key = this.getCartKey(productId, colorId ?? null);
    this.cart = this.cart.filter(i => this.getCartKey(i.product.id, i.selectedColor?.id ?? null) !== key);
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
