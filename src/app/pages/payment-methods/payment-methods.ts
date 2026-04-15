import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentMethods as PaymentMethodService } from '../../core/services/payment-methods/payment-methods';
import { ToastService } from '../../core/services/toast/toast.service';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';
import { ReturnPaymentMethodDto, UpdatePaymentMethodDto } from '../../core/models';

@Component({
  selector: 'app-payment-methods',
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
    MatChipsModule
  ],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.scss',
})
export class PaymentMethods implements OnInit {
  paymentMethods: ReturnPaymentMethodDto[] = [];
  filteredPaymentMethods: ReturnPaymentMethodDto[] = [];
  isLoading = false;

  displayedColumns: string[] = ['code', 'name', 'order', 'active', 'createdAt', 'actions'];

  searchForm: FormGroup;

  constructor(
    private paymentMethodService: PaymentMethodService,
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
    this.loadPaymentMethods();

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterPaymentMethods(value);
    });
  }

  loadPaymentMethods(): void {
    this.isLoading = true;
    this.paymentMethodService.getAllPaymentMethods().subscribe({
      next: (paymentMethods) => {
        this.paymentMethods = paymentMethods.sort((a, b) => (a.order || 999) - (b.order || 999));
        this.filteredPaymentMethods = [...this.paymentMethods];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.isLoading = false;
      }
    });
  }

  filterPaymentMethods(query: string): void {
    if (!query) {
      this.filteredPaymentMethods = [...this.paymentMethods];
      return;
    }

    this.filteredPaymentMethods = this.paymentMethods
      .filter(method =>
        method.name.toLowerCase().includes(query.toLowerCase()) ||
        method.code.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  createPaymentMethod(): void {
    this.router.navigate(['/pagamentos/novo']);
  }

  editPaymentMethod(paymentMethodId: string): void {
    this.router.navigate([`/pagamentos/${paymentMethodId}/editar`]);
  }

  deletePaymentMethod(paymentMethod: ReturnPaymentMethodDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o método de pagamento "${paymentMethod.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(paymentMethod.id);
      }
    });
  }

  private confirmDelete(paymentMethodId: string): void {
    this.isLoading = true;
    this.paymentMethodService.deletePaymentMethod(paymentMethodId).subscribe({
      next: () => {
        this.toastService.success('Método de pagamento excluído com sucesso!');
        this.loadPaymentMethods();
      },
      error: (error) => {
        console.error('Error deleting payment method:', error);
        const errorMessage = error?.error?.message || 'Erro ao excluir método de pagamento. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoading = false;
      }
    });
  }

  toggleStatus(paymentMethod: ReturnPaymentMethodDto): void {
    const newStatus = !paymentMethod.active;
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: `${newStatus ? 'Ativar' : 'Desativar'} Método de Pagamento`,
        message: `Tem certeza que deseja ${newStatus ? 'ativar' : 'desativar'} o método de pagamento "${paymentMethod.name}"?`,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateStatus(paymentMethod, newStatus);
      }
    });
  }

  private updateStatus(paymentMethod: ReturnPaymentMethodDto, active: boolean): void {
    this.isLoading = true;

    const updateData: UpdatePaymentMethodDto = {
      name: paymentMethod.name,
      active: active,
      order: paymentMethod.order || undefined
    };

    this.paymentMethodService.updatePaymentMethod(paymentMethod.id, updateData).subscribe({
      next: () => {
        this.toastService.success(`Método de pagamento ${active ? 'ativado' : 'desativado'} com sucesso!`);
        this.loadPaymentMethods();
      },
      error: (error) => {
        console.error('Error updating payment method status:', error);
        const errorMessage = error?.error?.message || 'Erro ao atualizar status. Tente novamente.';
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

  get searchQueryControl(): FormControl {
    return this.searchForm.get('searchQuery') as FormControl;
  }
}
