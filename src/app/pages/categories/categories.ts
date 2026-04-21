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
import { ReturnCategoryDto } from '../../core/models';
import { Categories as CategoryService } from '../../core/services/categories/categories';
import { ToastService } from '../../core/services/toast/toast.service';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';


@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  categories: ReturnCategoryDto[] = [];
  isLoading = false;
  total = 0;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];
  showInactive = false;

  displayedColumns: string[] = ['name', 'createdAt', 'actions'];

  searchForm: FormGroup;

  constructor(
    private categoryService: CategoryService,
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
    this.loadCategories();

    this.searchForm.get('searchQuery')?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    const search = this.searchForm.get('searchQuery')?.value || undefined;
    this.categoryService.getAllCategories(this.currentPage, this.pageSize, search, this.showInactive).subscribe({
      next: (res) => {
        this.categories = res.data;
        this.total = res.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  createCategory(): void {
    this.router.navigate(['/categorias/novo']);
  }

  editCategory(category: ReturnCategoryDto): void {
    this.router.navigate([`/categorias/${category.id}/editar`]);
  }

  deleteCategory(category: ReturnCategoryDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Inativação',
        message: `Tem certeza que deseja inativar a categoria "${category.name}"? Ela não aparecerá mais nas listagens ativas.`,
        confirmText: 'Inativar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(category.id);
      }
    });
  }

  private confirmDelete(categoryId: string): void {
    this.isLoading = true;
    this.categoryService.deleteCategory(categoryId).subscribe({
      next: () => {
        this.toastService.success('Categoria excluída com sucesso!');
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        const errorMessage = error?.error?.message || 'Erro ao excluir categoria. Tente novamente.';
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
    this.loadCategories();
  }

  reactivateCategory(category: ReturnCategoryDto): void {
    this.isLoading = true;
    this.categoryService.reactivateCategory(category.id).subscribe({
      next: () => {
        this.toastService.success(`Categoria "${category.name}" reativada!`);
        this.loadCategories();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erro ao reativar');
        this.isLoading = false;
      }
    });
  }

  permanentDeleteCategory(category: ReturnCategoryDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Excluir Permanentemente',
        message: `ATENÇÃO: Isso excluirá a categoria "${category.name}" definitivamente do banco de dados. Esta ação é irreversível!`,
        confirmText: 'Excluir Definitivamente',
        cancelText: 'Cancelar'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.categoryService.permanentDeleteCategory(category.id).subscribe({
          next: () => {
            this.toastService.success('Categoria excluída permanentemente!');
            this.loadCategories();
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
