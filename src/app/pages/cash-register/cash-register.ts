import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxCurrencyDirective } from 'ngx-currency';
import { CashRegisterDto } from '../../core/models/cash-register/cash-register.interface';
import { CashRegisterDetailsDialog } from './cash-register-details-dialog/cash-register-details-dialog';
import { CashRegisterService } from '../../core/services/cash-register/cash-register';
import { ToastService } from '../../core/services/toast/toast.service';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    NgxCurrencyDirective,
    BrlCurrencyPipe,
  ],
  templateUrl: './cash-register.html',
  styleUrl: './cash-register.scss',
})
export class CashRegisterComponent implements OnInit {
  currentCashRegister: CashRegisterDto | null = null;
  history: CashRegisterDto[] = [];
  totalHistory = 0;
  currentPage = 1;
  pageSize = 10;

  isLoading = false;
  activeTab = 0;

  openForm: FormGroup;
  closeForm: FormGroup;
  bleedForm: FormGroup;
  historyFilterForm: FormGroup;

  historyColumns: string[] = ['openedAt', 'closedAt', 'initialAmount', 'finalAmount', 'difference', 'status', 'actions'];
  bleedColumns: string[] = ['createdAt', 'reason', 'amount'];

  constructor(
    private fb: FormBuilder,
    private cashRegisterService: CashRegisterService,
    private toastService: ToastService,
    private dialog: MatDialog,
  ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    this.historyFilterForm = this.fb.group({
      date: [todayStr]
    });

    this.openForm = this.fb.group({
      initialAmount: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });

    this.closeForm = this.fb.group({
      finalAmount: [0, [Validators.required, Validators.min(0)]],
      closingNotes: [''],
    });

    this.bleedForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCurrent();
    this.loadHistory();
  }

  loadCurrent(): void {
    this.cashRegisterService.getCurrent().subscribe({
      next: (cr) => (this.currentCashRegister = cr),
      error: () => (this.currentCashRegister = null),
    });
  }

  loadHistory(page = this.currentPage): void {
    const date = this.historyFilterForm?.get('date')?.value || undefined;
    this.cashRegisterService.getAll(page, this.pageSize, date).subscribe({
      next: (res) => {
        this.history = res.data;
        this.totalHistory = res.total;
      },
      error: (err) => console.error(err),
    });
  }

  openCashRegister(): void {
    if (this.openForm.invalid) return;
    this.isLoading = true;
    this.cashRegisterService.open(this.openForm.value).subscribe({
      next: (cr) => {
        this.currentCashRegister = cr;
        this.openForm.reset({ initialAmount: 0, notes: '' });
        this.toastService.success('Caixa aberto com sucesso!');
        this.loadHistory();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erro ao abrir caixa.');
        this.isLoading = false;
      },
    });
  }

  closeCashRegister(): void {
    if (!this.currentCashRegister || this.closeForm.invalid) return;
    this.isLoading = true;
    this.cashRegisterService.close(this.currentCashRegister.id, this.closeForm.value).subscribe({
      next: (cr) => {
        this.currentCashRegister = cr;
        this.closeForm.reset({ finalAmount: 0, closingNotes: '' });
        this.toastService.success('Caixa fechado com sucesso!');
        this.loadHistory();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erro ao fechar caixa.');
        this.isLoading = false;
      },
    });
  }

  addBleed(): void {
    if (!this.currentCashRegister || this.bleedForm.invalid) return;
    this.isLoading = true;
    this.cashRegisterService.bleed(this.currentCashRegister.id, this.bleedForm.value).subscribe({
      next: () => {
        this.bleedForm.reset({ amount: null, reason: '' });
        this.toastService.success('Sangria registrada com sucesso!');
        this.loadCurrent();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Erro ao registrar sangria.');
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadHistory(this.currentPage);
  }

  setTodayFilter(): void {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.historyFilterForm.patchValue({ date: `${y}-${m}-${d}` });
    this.currentPage = 1;
    this.loadHistory(1);
  }

  searchHistory(): void {
    this.currentPage = 1;
    this.loadHistory(1);
  }

  clearHistoryFilter(): void {
    this.historyFilterForm.reset();
    this.currentPage = 1;
    this.loadHistory(1);
  }

  get isCashOpen(): boolean {
    return this.currentCashRegister?.status === 'OPEN';
  }

  viewDetails(cashRegister: CashRegisterDto): void {
    this.dialog.open(CashRegisterDetailsDialog, {
      width: '700px',
      maxHeight: '90vh',
      data: { cashRegister },
    });
  }

  get differenceClass(): string {
    if (!this.currentCashRegister?.difference) return '';
    return this.currentCashRegister.difference > 0 ? 'text-green-600' : this.currentCashRegister.difference < 0 ? 'text-red-600' : '';
  }
}
