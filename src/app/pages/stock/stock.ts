import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReturnStockDto } from '../../core/models';
import { StockService } from '../../core/services/stock/stock';
import { AdjustStockDialog } from './adjust-stock-dialog/adjust-stock-dialog';

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
    MatDialogModule
  ],
  templateUrl: './stock.html',
  styleUrl: './stock.scss',
})
export class Stock implements OnInit {
  isLoading = true;
  stocks: ReturnStockDto[] = [];
  displayedColumns = ['product', 'quantity', 'minQuantity', 'status', 'updatedAt', 'actions'];

  constructor(
    private stockService: StockService,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks(): void {
    this.isLoading = true;
    this.stockService.getAllStocks().subscribe({
      next: (stocks: ReturnStockDto[]) => {
        this.stocks = stocks;
        this.isLoading = false;

      },
      error: (error: any) => {
        console.error('Error loading stocks:', error);
        this.isLoading = false;
      }
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
    return this.stocks.filter(s => this.getStockStatus(s) === 'low' || this.getStockStatus(s) === 'out').length;
  }
}
