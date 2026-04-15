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
    MatTooltipModule
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  categories: ReturnCategoryDto[] = [];
  isLoading = false;

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

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterCategories(value);
    });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  filterCategories(query: string): void {
    if (!query) {
      this.loadCategories();
      return;
    }

    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(cat =>
          cat.name.toLowerCase().includes(query.toLowerCase())
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering categories:', error);
        this.isLoading = false;
      }
    });
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
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
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

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
}
