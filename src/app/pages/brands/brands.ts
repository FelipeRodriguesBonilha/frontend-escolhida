import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ReturnBrandDto } from '../../core/models';
import { Brands as BrandService } from '../../core/services/brands/brands';
import { ToastService } from '../../core/services/toast/toast.service';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-brands',
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
    MatTooltipModule
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands implements OnInit {
  brands: ReturnBrandDto[] = [];
  isLoading = false;

  displayedColumns: string[] = ['name', 'createdAt', 'actions'];

  searchForm: FormGroup;

  constructor(
    private brandService: BrandService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {
    this.searchForm = this.fb.group({
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.loadBrands();

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterBrands(value);
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.isLoading = false;
      }
    });
  }

  filterBrands(query: string): void {
    if (!query) {
      this.loadBrands();
      return;
    }

    this.isLoading = true;
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands.filter(brand =>
          brand.name.toLowerCase().includes(query.toLowerCase())
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering brands:', error);
        this.isLoading = false;
      }
    });
  }

  createBrand(): void {
    this.router.navigate(['/marcas/novo']);
  }

  editBrand(brand: ReturnBrandDto): void {
    this.router.navigate([`/marcas/${brand.id}/editar`]);
  }

  deleteBrand(brand: ReturnBrandDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a marca "${brand.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(brand.id);
      }
    });
  }

  private confirmDelete(brandId: string): void {
    this.isLoading = true;
    this.brandService.deleteBrand(brandId).subscribe({
      next: () => {
        this.toastService.success('Marca excluída com sucesso!');
        this.loadBrands();
      },
      error: (error) => {
        console.error('Error deleting brand:', error);
        const errorMessage = error?.error?.message || 'Erro ao excluir marca. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
}
