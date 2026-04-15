import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast/toast.service';
import { CreateCategoryDto, ReturnCategoryDto, UpdateCategoryDto } from '../../../core/models';
import { Categories as CategoryService } from '../../../core/services/categories/categories';

@Component({
  selector: 'app-categories-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './categories-form.html',
  styleUrl: './categories-form.scss',
})
export class CategoriesForm implements OnInit {
  categoryForm: FormGroup;
  isEditing = false;
  isLoading = false;
  categoryId: string | null = null;
  category: ReturnCategoryDto | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.categoryId = id;
        this.loadCategory(id);
      }
    });
  }

  loadCategory(id: string): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        if (category) {
          this.category = category;
          this.categoryForm.patchValue({
            name: category.name,
            active: category.active
          });
        } else {
          console.error('Category not found');
          this.router.navigate(['/categorias']);
        }
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error loading category:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.categoryId) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  private createCategory(): void {
    const categoryData: CreateCategoryDto = {
      name: this.categoryForm.value.name!
    };

    this.categoryService.createCategory(categoryData).subscribe({
      next: () => {
        this.toastService.success('Categoria criada com sucesso!');
        this.router.navigate(['/categorias']);
      },
      error: (error) => {
        console.error('Error creating category:', error);
        const errorMessage = error?.error?.message || 'Erro ao criar categoria. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private updateCategory(): void {
    if (!this.categoryId) return;

    const categoryData: UpdateCategoryDto = {
      name: this.categoryForm.value.name!,
      active: this.categoryForm.value.active
    };

    this.categoryService.updateCategory(this.categoryId, categoryData).subscribe({
      next: () => {
        this.toastService.success('Categoria atualizada com sucesso!');
        this.router.navigate(['/categorias']);
      },
      error: (error) => {
        console.error('Error updating category:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar categoria. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/categorias']);
  }

  getErrorMessage(field: string): string {
    const control = this.categoryForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  get title(): string {
    return this.isEditing ? 'Editar Categoria' : 'Nova Categoria';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Salvar Alterações' : 'Criar Categoria';
  }
}
