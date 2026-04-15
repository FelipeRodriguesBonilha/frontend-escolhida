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
import { CreateSupplierDto, ReturnSupplierDto, UpdateSupplierDto } from '../../../core/models';
import { Suppliers as SupplierService } from '../../../core/services/suppliers/suppliers';

@Component({
  selector: 'app-suppliers-form',
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
  templateUrl: './suppliers-form.html',
  styleUrl: './suppliers-form.scss',
})
export class SuppliersForm implements OnInit {
  supplierForm: FormGroup;
  isEditing = false;
  isLoading = false;
  supplierId: string | null = null;
  supplier: ReturnSupplierDto | null = null;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      cnpj: ['', [Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)]],
      phone: ['', [Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$|^\(\d{2}\) \d{4}-\d{4}$|^\d{10,11}$/)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.maxLength(200)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.supplierId = id;
        this.loadSupplier(id);
      }
    });
  }

  loadSupplier(id: string): void {
    this.isLoading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (supplier) => {
        if (supplier) {
          this.supplier = supplier;
          this.supplierForm.patchValue({
            name: supplier.name,
            cnpj: supplier.cnpj || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            active: supplier.active
          });
        } else {
          console.error('Supplier not found');
          this.router.navigate(['/fornecedores']);
        }
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error loading supplier:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.supplierId) {
      this.updateSupplier();
    } else {
      this.createSupplier();
    }
  }

  private createSupplier(): void {
    const supplierData: CreateSupplierDto = {
      name: this.supplierForm.value.name!,
      cnpj: this.cleanCNPJ(this.supplierForm.value.cnpj) || undefined,
      phone: this.cleanPhone(this.supplierForm.value.phone) || undefined,
      email: this.supplierForm.value.email || undefined,
      address: this.supplierForm.value.address || undefined
    };

    this.supplierService.createSupplier(supplierData).subscribe({
      next: () => {
        this.toastService.success('Fornecedor cadastrado com sucesso!');
        this.router.navigate(['/fornecedores']);
      },
      error: (error) => {
        console.error('Error creating supplier:', error);
        const errorMessage = error?.error?.message || 'Erro ao cadastrar fornecedor. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private updateSupplier(): void {
    if (!this.supplierId) return;

    const supplierData: UpdateSupplierDto = {
      name: this.supplierForm.value.name!,
      cnpj: this.cleanCNPJ(this.supplierForm.value.cnpj) || undefined,
      phone: this.cleanPhone(this.supplierForm.value.phone) || undefined,
      email: this.supplierForm.value.email || undefined,
      address: this.supplierForm.value.address || undefined,
      active: this.supplierForm.value.active
    };

    this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
      next: () => {
        this.toastService.success('Fornecedor atualizado com sucesso!');
        this.router.navigate(['/fornecedores']);
      },
      error: (error) => {
        console.error('Error updating supplier:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar fornecedor. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/fornecedores']);
  }

  getErrorMessage(field: string): string {
    const control = this.supplierForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Email inválido';
    if (errors['pattern']) {
      if (field === 'cnpj') return 'CNPJ inválido (14 dígitos)';
      if (field === 'phone') return 'Telefone inválido (10 ou 11 dígitos)';
    }

    return 'Campo inválido';
  }

  get title(): string {
    return this.isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor';
  }

  formatCNPJ(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  }

  formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  onCNPJInput(event: any): void {
    const value = event.target.value;
    const formatted = this.formatCNPJ(value);
    this.supplierForm.get('cnpj')?.setValue(formatted, { emitEvent: false });
  }

  onPhoneInput(event: any): void {
    const value = event.target.value;
    const formatted = this.formatPhone(value);
    this.supplierForm.get('phone')?.setValue(formatted, { emitEvent: false });
  }

  private cleanCNPJ(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.replace(/\D/g, '');
  }

  private cleanPhone(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.replace(/\D/g, '');
  }
}
