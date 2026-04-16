import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ReturnProductDto } from '../../core/models';
import { Products as ProductService } from '../../core/services/products/products';
import { Upload } from '../../core/services/upload/upload';
import { ToastService } from '../../core/services/toast/toast.service';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  products: ReturnProductDto[] = [];
  filteredProducts: ReturnProductDto[] = [];
  isLoading = false;
  productImageUrls = new Map<string, string>();

  displayedColumns: string[] = ['name', 'price', 'stock', 'category', 'brand', 'supplier', 'createdAt', 'actions'];

  searchForm: FormGroup;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
    private uploadService: Upload,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    this.searchForm = this.fb.group({
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterProducts(value);
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...products];
        this.loadProductImages(products);
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  private loadProductImages(products: ReturnProductDto[]): void {
    products.forEach(product => {
      if (product.imageUrl) {
        this.uploadService.getSecureImageUrl(product.imageUrl).subscribe(url => {
          this.productImageUrls.set(product.id, url);
        });
      }
    });
  }

  filterProducts(query: string): void {
    if (!query) {
      this.filteredProducts = [...this.products];

      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.barcode && product.barcode.includes(query)) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
      (product.category && product.category.name.toLowerCase().includes(query.toLowerCase())) ||
      (product.brand && product.brand.name.toLowerCase().includes(query.toLowerCase())) ||
      (product.supplier && product.supplier.name.toLowerCase().includes(query.toLowerCase()))
    );
  }

  createProduct(): void {
    this.router.navigate(['/produtos/novo']);
  }

  editProduct(product: ReturnProductDto): void {
    this.router.navigate([`/produtos/${product.id}/editar`]);
  }

  deleteProduct(product: ReturnProductDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(product.id);
      }
    });
  }

  private confirmDelete(productId: string): void {
    this.isLoading = true;
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.toastService.success('Produto excluído com sucesso!');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        const errorMessage = error?.error?.message || 'Erro ao excluir produto. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  getCategoryName(product: ReturnProductDto): string {
    return product.category?.name || 'N/A';
  }

  getBrandName(product: ReturnProductDto): string {
    return product.brand?.name || 'N/A';
  }

  getSupplierName(product: ReturnProductDto): string {
    return product.supplier?.name || 'N/A';
  }

  getStockQuantity(product: ReturnProductDto): number {
    return product.stock?.quantity || 0;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getProductImageUrl(product: ReturnProductDto): string {
    return this.productImageUrls.get(product.id) || '';
  }

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
}
