import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ReturnDailyReportDto, ReturnMonthlyReportDto } from '../../core/models';
import { Reports as ReportsService } from '../../core/services/reports/reports';
import { ToastService } from '../../core/services/toast/toast.service';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-reports',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    BrlCurrencyPipe
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  dailyForm: FormGroup;
  monthlyForm: FormGroup;

  dailyReport: ReturnDailyReportDto | null = null;
  monthlyReport: ReturnMonthlyReportDto | null = null;

  isLoadingDaily = false;
  isLoadingMonthly = false;

  currentYear = new Date().getFullYear();
  years = Array.from({ length: 5 }, (_, i) => this.currentYear - i);
  months = [
    { value: 1, name: 'Janeiro' },
    { value: 2, name: 'Fevereiro' },
    { value: 3, name: 'Março' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Maio' },
    { value: 6, name: 'Junho' },
    { value: 7, name: 'Julho' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Setembro' },
    { value: 10, name: 'Outubro' },
    { value: 11, name: 'Novembro' },
    { value: 12, name: 'Dezembro' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private toastService: ToastService
  ) {
    const today = new Date();
    this.dailyForm = this.fb.group({
      date: [today.toISOString().split('T')[0], Validators.required]
    });

    this.monthlyForm = this.fb.group({
      year: [today.getFullYear(), Validators.required],
      month: [today.getMonth() + 1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDailyReport();
  }

  loadDailyReport(): void {
    if (this.dailyForm.invalid) return;

    this.isLoadingDaily = true;
    const date = this.dailyForm.value.date;

    this.reportsService.getDailyReport(date).subscribe({
      next: (report) => {
        this.dailyReport = report;
        this.isLoadingDaily = false;
      },
      error: (error) => {
        console.error('Error loading daily report:', error);
        const errorMessage = error?.error?.message || 'Erro ao carregar relatório diário. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoadingDaily = false;
      }
    });
  }

  loadMonthlyReport(): void {
    if (this.monthlyForm.invalid) return;

    this.isLoadingMonthly = true;
    const { year, month } = this.monthlyForm.value;

    this.reportsService.getMonthlyReport(year, month).subscribe({
      next: (report) => {
        this.monthlyReport = report;
        this.isLoadingMonthly = false;
      },
      error: (error) => {
        console.error('Error loading monthly report:', error);
        const errorMessage = error?.error?.message || 'Erro ao carregar relatório mensal. Tente novamente.';
        this.toastService.error(errorMessage);
        this.isLoadingMonthly = false;
      }
    });
  }

  getPaymentMethodsArray(data: Record<string, number>): Array<{ method: string; amount: number }> {
    return Object.entries(data).map(([method, amount]) => ({ method, amount }));
  }

  getDailyDataArray(): Array<{ day: string; sales: number; revenue: number }> {
    if (!this.monthlyReport?.byDay) return [];
    return Object.entries(this.monthlyReport.byDay)
      .map(([day, data]) => ({ day, sales: data.totalSales, revenue: data.totalRevenue }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }

  getTotalProductsSold(): number {
    if (!this.dailyReport?.topProducts) return 0;
    return this.dailyReport.topProducts.reduce((sum, p) => sum + p.quantity, 0);
  }
}
