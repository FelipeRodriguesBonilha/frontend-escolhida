import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
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
import { CatalogBrand, CatalogCategory, CatalogService } from '../../core/services/catalog/catalog.service';
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
  brands: CatalogBrand[] = [];
  cart: CartItem[] = [];

  searchQuery = '';
  selectedCategoryId = '';
  selectedBrandId = '';
  categorySearch = '';
  brandSearch = '';
  showCategoryDropdown = false;
  showBrandDropdown = false;
  filterPromotion = false;
  filterNew = false;
  isLoading = false;
  showCart = false;
  promotionProducts: ReturnProductDto[] = [];
  isLoadingPromotion = false;
  newProducts: ReturnProductDto[] = [];
  isLoadingNew = false;

  currentPage = 1;
  pageSize = 12;
  total = 0;

  searchTimeout: ReturnType<typeof setTimeout> | null = null;

  get filteredCategories(): CatalogCategory[] {
    const q = this.categorySearch.toLowerCase();
    if (!q) return this.categories;
    return this.categories.filter(c => c.name.toLowerCase().includes(q));
  }

  get selectedCategoryName(): string {
    if (!this.selectedCategoryId) return 'Todas as categorias';
    return this.categories.find(c => c.id === this.selectedCategoryId)?.name ?? 'Todas as categorias';
  }

  get filteredBrands(): CatalogBrand[] {
    const q = this.brandSearch.toLowerCase();
    if (!q) return this.brands;
    return this.brands.filter(b => b.name.toLowerCase().includes(q));
  }

  get selectedBrandName(): string {
    if (!this.selectedBrandId) return 'Todas as marcas';
    return this.brands.find(b => b.id === this.selectedBrandId)?.name ?? 'Todas as marcas';
  }

  constructor(
    private catalogService: CatalogService,
    private dialog: MatDialog,
    private elRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.querySelector('.category-dropdown-wrapper')?.contains(event.target)) {
      this.showCategoryDropdown = false;
    }
    if (!this.elRef.nativeElement.querySelector('.brand-dropdown-wrapper')?.contains(event.target)) {
      this.showBrandDropdown = false;
    }
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadPromotionProducts();
    this.loadNewProducts();
    this.loadProducts();
  }

  loadCategories(): void {
    this.catalogService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
    });
  }

  loadBrands(): void {
    this.catalogService.getBrands(this.selectedCategoryId || undefined).subscribe({
      next: (brands) => (this.brands = brands),
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
        this.selectedBrandId || undefined,
        this.filterPromotion || undefined,
        this.filterNew || undefined,
      )
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.total = res.total;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  loadPromotionProducts(): void {
    this.isLoadingPromotion = true;
    this.catalogService.getProducts(1, 500, undefined, undefined, undefined, true).subscribe({
      next: (res) => {
        this.promotionProducts = res.data;
        this.isLoadingPromotion = false;
      },
      error: () => {
        this.isLoadingPromotion = false;
      },
    });
  }

  loadNewProducts(): void {
    this.isLoadingNew = true;
    this.catalogService.getProducts(1, 500, undefined, undefined, undefined, undefined, true).subscribe({
      next: (res) => {
        this.newProducts = res.data;
        this.isLoadingNew = false;
      },
      error: () => {
        this.isLoadingNew = false;
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
    this.selectedBrandId = '';
    this.currentPage = 1;
    if (id) this.loadBrands();
    else this.brands = [];
    this.loadProducts();
  }

  selectBrand(id: string): void {
    this.selectedBrandId = id;
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategoryId = '';
    this.selectedBrandId = '';
    this.filterPromotion = false;
    this.filterNew = false;
    this.brands = [];
    this.currentPage = 1;
    this.loadProducts();
  }

  togglePromotionFilter(): void {
    this.filterPromotion = !this.filterPromotion;
    this.currentPage = 1;
    this.loadProducts();
  }

  toggleNewFilter(): void {
    this.filterNew = !this.filterNew;
    this.currentPage = 1;
    this.loadProducts();
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedCategoryId || this.selectedBrandId || this.filterPromotion || this.filterNew);
  }

  get isHomeView(): boolean {
    return !this.filterPromotion && !this.filterNew && !this.searchQuery && !this.selectedCategoryId && !this.selectedBrandId;
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const window = 5;
    if (total <= window) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    let start = Math.max(1, this.currentPage - Math.floor(window / 2));
    let end = start + window - 1;
    if (end > total) {
      end = total;
      start = end - window + 1;
    }
    return Array.from({ length: window }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    setTimeout(() => {
      if (page === 1) {
        window.scrollTo({ behavior: 'smooth', top: 0 });
      } else {
        const element = this.elRef.nativeElement.querySelector('#all-products-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
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
    return this.cart.reduce((sum, item) => sum + item.product.effectivePrice * item.quantity, 0);
  }

  get cartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  isOutOfStock(product: ReturnProductDto): boolean {
    return (product.stock?.quantity ?? 0) <= 0;
  }

  isLowStock(product: ReturnProductDto): boolean {
    if (!product.stock) return false;
    return product.stock.quantity > 0 && product.stock.quantity <= product.stock.minQuantity;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  openWhatsApp(): void {
    if (this.cart.length === 0) return;

    const lines = this.cart.map(item => {
      const color = item.selectedColor ? ` (${item.selectedColor.name})` : '';
      return `• ${item.quantity}x ${item.product.name}${color} - ${this.formatCurrency(item.product.effectivePrice * item.quantity)}`;
    });

    const total = this.formatCurrency(this.cartTotal);
    const text = `Olá! Tenho interesse nos seguintes produtos:\n\n${lines.join('\n')}\n\n*Total: ${total}*\n\nPoderia me ajudar?`;
    window.open(`https://wa.me/5514998198164?text=${encodeURIComponent(text)}`, '_blank');
  }
}
