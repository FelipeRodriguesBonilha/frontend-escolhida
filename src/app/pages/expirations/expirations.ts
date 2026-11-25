import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReturnProductDto } from '../../core/models';
import { Products as ProductService } from '../../core/services/products/products';

type ExpirationFilter = 'expiring' | 'expired' | 'all';

@Component({
  selector: 'app-expirations',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './expirations.html',
  styleUrl: './expirations.scss',
})
export class Expirations implements OnInit {
  isLoading = true;
  expired: ReturnProductDto[] = [];
  expiring: ReturnProductDto[] = [];
  filter: ExpirationFilter = 'expiring';
  searchForm: FormGroup;
  displayedColumns = ['product', 'category', 'stock', 'expirationDate', 'days', 'status'];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({ searchQuery: [''] });
  }

  ngOnInit(): void {
    this.productService.getExpirations(90).subscribe({
      next: (res) => {
        this.expired = res.expired;
        this.expiring = res.expiring;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expirations:', error);
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: ExpirationFilter): void {
    this.filter = filter;
  }

  get products(): ReturnProductDto[] {
    let list: ReturnProductDto[];
    if (this.filter === 'expired') list = this.expired;
    else if (this.filter === 'expiring') list = this.expiring;
    else list = [...this.expired, ...this.expiring];

    const query = (this.searchForm.get('searchQuery')?.value || '').trim().toLowerCase();
    if (!query) return list;
    return list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      (p.barcode ?? '').toLowerCase().includes(query) ||
      (p.category?.name ?? '').toLowerCase().includes(query) ||
      (p.brand?.name ?? '').toLowerCase().includes(query)
    );
  }

  isExpired(product: ReturnProductDto): boolean {
    return this.daysUntil(product) < 0;
  }

  daysUntil(product: ReturnProductDto): number {
    if (!product.expirationDate) return 0;
    const exp = new Date(product.expirationDate);
    exp.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((exp.getTime() - today.getTime()) / 86400000);
  }

  daysLabel(product: ReturnProductDto): string {
    const days = this.daysUntil(product);
    if (days === 0) return 'Vence hoje';
    if (days < 0) return `Venceu há ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
    return `Vence em ${days} dia${days === 1 ? '' : 's'}`;
  }

  statusLabel(product: ReturnProductDto): string {
    return this.isExpired(product) ? 'Vencido' : 'A vencer';
  }
}
