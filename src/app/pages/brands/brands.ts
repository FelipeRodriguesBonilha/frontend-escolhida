import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './brands.html',
  styleUrl: './brands.scss',
})
export class Brands implements OnInit {
  brands: ReturnBrandDto[] = [];
  isLoading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  showInactive = false;

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

    this.searchForm.get('searchQuery')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadBrands();
    });
  }

  loadBrands(): void {
    this.isLoading = true;
    const search = this.searchForm.get('searchQuery')?.value || undefined;
    this.brandService.getAllBrands(this.currentPage, this.pageSize, search, this.showInactive).subscribe({
      next: (res) => {
        this.brands = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadBrands();
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
        title: 'Confirmar Inativação',
        message: `Tem certeza que deseja inativar a marca "${brand.name}"? Ela não aparecerá mais nas listagens ativas.`,
        confirmText: 'Inativar',
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

  toggleInactiveFilter(): void {
    this.showInactive = !this.showInactive;
    this.currentPage = 1;
    this.loadBrands();
  }

  reactivateBrand(brand: ReturnBrandDto): void {
    this.isLoading = true;
    this.brandService.reactivateBrand(brand.id).subscribe({
      next: () => {
        this.toastService.success(`Marca "${brand.name}" reativada!`);
        this.loadBrands();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erro ao reativar');
        this.isLoading = false;
      }
    });
  }

  permanentDeleteBrand(brand: ReturnBrandDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Excluir Permanentemente',
        message: `ATENÇÃO: Isso excluirá a marca "${brand.name}" definitivamente do banco de dados. Esta ação é irreversível!`,
        confirmText: 'Excluir Definitivamente',
        cancelText: 'Cancelar'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.brandService.permanentDeleteBrand(brand.id).subscribe({
          next: () => {
            this.toastService.success('Marca excluída permanentemente!');
            this.loadBrands();
          },
          error: (err) => {
            this.toastService.error(err?.error?.message || 'Erro ao excluir permanentemente');
            this.isLoading = false;
          }
        });
      }
    });
  }

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
}
