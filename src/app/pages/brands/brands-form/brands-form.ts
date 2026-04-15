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
import { CreateBrandDto, ReturnBrandDto, UpdateBrandDto } from '../../../core/models';
import { Brands as BrandService } from '../../../core/services/brands/brands';

@Component({
  selector: 'app-brands-form',
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
  templateUrl: './brands-form.html',
  styleUrl: './brands-form.scss',
})
export class BrandsForm implements OnInit {
  brandForm: FormGroup;
  isEditing = false;
  isLoading = false;
  brandId: string | null = null;
  brand: ReturnBrandDto | null = null;

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.brandForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.brandId = id;
        this.loadBrand(id);
      }
    });
  }

  loadBrand(id: string): void {
    this.isLoading = true;
    this.brandService.getBrandById(id).subscribe({
      next: (brand) => {
        if (brand) {
          this.brand = brand;
          this.brandForm.patchValue({
            name: brand.name,
            active: brand.active
          });
        } else {
          console.error('Brand not found');
          this.router.navigate(['/marcas']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brand:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.brandId) {
      this.updateBrand();
    } else {
      this.createBrand();
    }
  }

  private createBrand(): void {
    const brandData: CreateBrandDto = {
      name: this.brandForm.value.name!
    };

    this.brandService.createBrand(brandData).subscribe({
      next: () => {
        this.toastService.success('Marca criada com sucesso!');
        this.router.navigate(['/marcas']);
      },
      error: (error) => {
        console.error('Error creating brand:', error);
        const errorMessage = error?.error?.message || 'Erro ao criar marca. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private updateBrand(): void {
    if (!this.brandId) return;

    const brandData: UpdateBrandDto = {
      name: this.brandForm.value.name!,
      active: this.brandForm.value.active
    };

    this.brandService.updateBrand(this.brandId, brandData).subscribe({
      next: () => {
        this.toastService.success('Marca atualizada com sucesso!');
        this.router.navigate(['/marcas']);
      },
      error: (error) => {
        console.error('Error updating brand:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar marca. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/marcas']);
  }

  getErrorMessage(field: string): string {
    const control = this.brandForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;

    return 'Campo inválido';
  }

  get title(): string {
    return this.isEditing ? 'Editar Marca' : 'Nova Marca';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Salvar Alterações' : 'Criar Marca';
  }
}
