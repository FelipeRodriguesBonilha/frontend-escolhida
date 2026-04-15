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
import { ReturnSupplierDto } from '../../core/models';
import { Suppliers as SupplierService } from '../../core/services/suppliers/suppliers';
import { ToastService } from '../../core/services/toast/toast.service';
import { ConfirmationDialog } from '../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-suppliers',
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
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss',
})
export class Suppliers implements OnInit {
  suppliers: ReturnSupplierDto[] = [];
  isLoading = false;

  displayedColumns: string[] = ['name', 'cnpj', 'phone', 'email', 'createdAt', 'actions'];

  searchForm: FormGroup;

  constructor(
    private supplierService: SupplierService,
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
    this.loadSuppliers();

    this.searchForm.get('searchQuery')?.valueChanges.subscribe(value => {
      this.filterSuppliers(value);
    });
  }

  loadSuppliers(): void {
    this.isLoading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.isLoading = false;
      }
    });
  }

  filterSuppliers(query: string): void {
    if (!query) {
      this.loadSuppliers();
      return;
    }

    this.isLoading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (suppliers) => {
        this.suppliers = suppliers.filter(supplier =>
          supplier.name.toLowerCase().includes(query.toLowerCase()) ||
          (supplier.cnpj && supplier.cnpj.includes(query)) ||
          (supplier.email && supplier.email.toLowerCase().includes(query.toLowerCase())) ||
          (supplier.phone && supplier.phone.includes(query))
        );
        this.isLoading = false;

      },
      error: (error) => {
        console.error('Error filtering suppliers:', error);
        this.isLoading = false;
      }
    });
  }

  createSupplier(): void {
    this.router.navigate(['/fornecedores/novo']);
  }

  editSupplier(supplier: ReturnSupplierDto): void {
    this.router.navigate([`/fornecedores/${supplier.id}/editar`]);
  }

  deleteSupplier(supplier: ReturnSupplierDto): void {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o fornecedor "${supplier.name}"? Esta ação não pode ser desfeita.`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDelete(supplier.id);
      }
    });
  }

  private confirmDelete(supplierId: string): void {
    this.isLoading = true;
    this.supplierService.deleteSupplier(supplierId).subscribe({
      next: () => {
        this.toastService.success('Fornecedor excluído com sucesso!');
        this.loadSuppliers();
      },
      error: (error) => {
        console.error('Error deleting supplier:', error);
        const errorMessage = error?.error?.message || 'Erro ao excluir fornecedor. Tente novamente.';
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

  formatCNPJ(cnpj: string | null): string {
    if (!cnpj) return 'N/A';

    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  formatPhone(phone: string | null): string {
    if (!phone) return 'N/A';

    return phone.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      .replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  clearSearch(): void {
    this.searchForm.get('searchQuery')?.setValue('');
  }
}
