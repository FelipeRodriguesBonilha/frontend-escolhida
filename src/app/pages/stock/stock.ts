import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ReturnStockDto } from '../../core/models';
import { Products as ProductService } from '../../core/services/products/products';
import { StockService } from '../../core/services/stock/stock';
import { ToastService } from '../../core/services/toast/toast.service';
import { AdjustStockDialog } from './adjust-stock-dialog/adjust-stock-dialog';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-stock',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
})
export class Stock implements OnInit {
  isLoading = true;
  stocks: ReturnStockDto[] = [];
  total = 0;
  lowStockCount = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  showInactive = false;
  displayedColumns = ['product', 'quantity', 'minQuantity', 'status', 'updatedAt', 'actions'];
  searchForm: FormGroup;

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private toastService: ToastService
  ) {
    this.searchForm = this.fb.group({ searchQuery: [''] });
  }

  ngOnInit(): void {
    this.loadStocks();
    this.loadLowStockCount();

    this.searchForm.get('searchQuery')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadStocks();
    });
  }

  loadStocks(): void {
    this.isLoading = true;
    const search = this.searchForm.get('searchQuery')?.value || undefined;
    this.stockService.getAllStocks(this.currentPage, this.pageSize, search, this.showInactive).subscribe({
      next: (res) => {
        this.stocks = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stocks:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadStocks();
  }

  toggleInactiveFilter(): void {
    this.showInactive = !this.showInactive;
    this.currentPage = 1;
    this.loadStocks();
  }

  reactivateStockProduct(stock: ReturnStockDto): void {
    this.isLoading = true;
    this.productService.reactivateProduct(stock.productId).subscribe({
      next: () => {
        this.toastService.success(`Produto "${stock.product?.name}" reativado!`);
        this.loadStocks();
        this.loadLowStockCount();
      },
      error: (err: any) => {
        this.toastService.error(err?.error?.message || 'Erro ao reativar');
        this.isLoading = false;
      }
    });
  }

  permanentDeleteStockProduct(stock: ReturnStockDto): void {
    const productName = stock.product?.name || 'este produto';
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Excluir Permanentemente',
        message: `ATENÇÃO: Isso excluirá o produto "${productName}" e seu estoque definitivamente. Esta ação é irreversível!`,
        confirmText: 'Excluir Definitivamente',
        cancelText: 'Cancelar'
      }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.stockService.permanentDeleteStockProduct(stock.productId).subscribe({
          next: () => {
            this.toastService.success('Produto excluído permanentemente!');
            this.loadStocks();
            this.loadLowStockCount();
          },
          error: (err: any) => {
            this.toastService.error(err?.error?.message || 'Erro ao excluir permanentemente');
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadLowStockCount(): void {
    this.stockService.getLowStock().subscribe({
      next: (stocks) => { this.lowStockCount = stocks.length; },
      error: () => {}
    });
  }

  getStockStatus(stock: ReturnStockDto): 'low' | 'ok' | 'out' {
    if (stock.quantity === 0) return 'out';
    if (stock.quantity <= stock.minQuantity) return 'low';
    return 'ok';
  }

  getStockStatusLabel(stock: ReturnStockDto): string {
    const status = this.getStockStatus(stock);
    if (status === 'out') return 'Sem Estoque';
    if (status === 'low') return 'Estoque Baixo';
    return 'Normal';
  }

  openAdjustDialog(stock: ReturnStockDto): void {
    const dialogRef = this.dialog.open(AdjustStockDialog, {
      width: '500px',
      data: { stock, product: stock.product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStocks();
      }
    });
  }

  getLowStockCount(): number {
    return this.lowStockCount;
  }
}
