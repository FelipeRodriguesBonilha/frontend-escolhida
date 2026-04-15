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
import { CreatePaymentMethodDto, ReturnPaymentMethodDto, UpdatePaymentMethodDto } from '../../../core/models';
import { PaymentMethods as PaymentMethodService } from '../../../core/services/payment-methods/payment-methods';

@Component({
  selector: 'app-payment-methods-form',
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
  templateUrl: './payment-methods-form.html',
  styleUrl: './payment-methods-form.scss',
})
export class PaymentMethodsForm implements OnInit {
  paymentMethodForm: FormGroup;
  isEditing = false;
  isLoading = false;
  paymentMethodId: string | null = null;
  paymentMethod: ReturnPaymentMethodDto | null = null;

  constructor(
    private fb: FormBuilder,
    private paymentMethodService: PaymentMethodService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    this.paymentMethodForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      active: [true],
      order: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.paymentMethodId = id;
        this.loadPaymentMethod(id);
      }
    });
  }

  loadPaymentMethod(id: string): void {
    this.isLoading = true;
    this.paymentMethodService.getPaymentMethodById(id).subscribe({
      next: (paymentMethod) => {
        if (paymentMethod) {
          this.paymentMethod = paymentMethod;
          this.paymentMethodForm.patchValue({
            code: paymentMethod.code,
            name: paymentMethod.name,
            active: paymentMethod.active,
            order: paymentMethod.order || 0
          });

          this.paymentMethodForm.get('code')?.disable();
        } else {
          console.error('Payment method not found');
          this.router.navigate(['/pagamentos']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payment method:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentMethodForm.invalid) {
      this.paymentMethodForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.paymentMethodId) {
      this.updatePaymentMethod();
    } else {
      this.createPaymentMethod();
    }
  }

  private createPaymentMethod(): void {
    const paymentMethodData: CreatePaymentMethodDto = {
      code: this.paymentMethodForm.value.code!,
      name: this.paymentMethodForm.value.name!,
      active: this.paymentMethodForm.value.active,
      order: this.paymentMethodForm.value.order || undefined
    };

    this.paymentMethodService.createPaymentMethod(paymentMethodData).subscribe({
      next: () => {
        this.toastService.success('Método de pagamento criado com sucesso!');
        this.router.navigate(['/pagamentos']);
      },
      error: (error) => {
        console.error('Error creating payment method:', error);
        const errorMessage = error?.error?.message || 'Erro ao criar método de pagamento. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  private updatePaymentMethod(): void {
    if (!this.paymentMethodId) return;

    const paymentMethodData: UpdatePaymentMethodDto = {
      name: this.paymentMethodForm.value.name!,
      active: this.paymentMethodForm.value.active,
      order: this.paymentMethodForm.value.order || undefined
    };

    this.paymentMethodService.updatePaymentMethod(this.paymentMethodId, paymentMethodData).subscribe({
      next: () => {
        this.toastService.success('Método de pagamento atualizado com sucesso!');
        this.router.navigate(['/pagamentos']);
      },
      error: (error) => {
        console.error('Error updating payment method:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar método de pagamento. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/pagamentos']);
  }

  getErrorMessage(field: string): string {
    const control = this.paymentMethodForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Campo obrigatório';
    if (errors['minlength']) return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return 'Valor deve ser maior ou igual a 0';

    return 'Campo inválido';
  }

  get title(): string {
    return this.isEditing ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento';
  }

  get submitButtonText(): string {
    return this.isEditing ? 'Salvar Alterações' : 'Cadastrar Método';
  }
}
