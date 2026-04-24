import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReturnStockDto } from '../../core/models';
import { Reports, SalesChartData, TopProductsData } from '../../core/services/reports/reports';
import { StockService } from '../../core/services/stock/stock';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    BrlCurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  isLoading = true;
  todayReport: any | null = null;
  lowStockCount = 0;

  selectedPeriod: 'quarter' | 'semester' | 'annual' = 'quarter';
  salesChartData: SalesChartData | null = null;
  topProductsData: TopProductsData | null = null;
  salesChart: Chart | null = null;
  topProductsChart: Chart | null = null;

  @ViewChild('salesChartCanvas') salesChartCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProductsChartCanvas') topProductsChartCanvas?: ElementRef<HTMLCanvasElement>;

  quickActions = [
    { label: 'Nova Venda', icon: 'point_of_sale', path: '/vendas', color: 'primary' },
    { label: 'Produtos', icon: 'inventory_2', path: '/produtos', color: 'accent' },
    { label: 'Relatórios', icon: 'assessment', path: '/relatorios', color: 'warn' },
  ];

  constructor(
    private reportsService: Reports,
    private stockService: StockService,

  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    this.tryRenderCharts();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.reportsService.getTodaySummary().subscribe({
      next: (report: any) => {
        this.todayReport = report;
        this.isLoading = false;

      },
      error: (error: any) => {
        console.error('Error loading today report:', error);
        this.isLoading = false;
      }
    });

    this.stockService.getLowStock().subscribe({
      next: (stocks: ReturnStockDto[]) => {
        this.lowStockCount = stocks.length;
      },
      error: (error: any) => {
        console.error('Error loading low stock:', error);
      }
    });

    this.loadSalesChart();
    this.loadTopProducts();
  }

  loadSalesChart(): void {
    this.reportsService.getSalesChartData(this.selectedPeriod).subscribe({
      next: (data: SalesChartData) => {
        this.salesChartData = data;
        this.tryRenderCharts();
      },
      error: (error: any) => {
        console.error('Error loading sales chart:', error);
      }
    });
  }

  loadTopProducts(): void {
    this.reportsService.getTopProductsCurrentMonth(10).subscribe({
      next: (data: TopProductsData) => {
        this.topProductsData = data;
        this.tryRenderCharts();
      },
      error: (error: any) => {
        console.error('Error loading top products:', error);
      }
    });
  }

  changePeriod(period: 'quarter' | 'semester' | 'annual'): void {
    this.selectedPeriod = period;
    this.loadSalesChart();
  }

  tryRenderCharts(): void {
    if (this.salesChartData) {
      this.renderSalesChart();
    }
    if (this.topProductsData) {
      this.renderTopProductsChart();
    }
  }

  renderSalesChart(retryCount: number = 0): void {
    if (!this.salesChartData) return;

    const canvas = this.salesChartCanvas?.nativeElement;
    if (!canvas) {
      if (retryCount < 15) {
        setTimeout(() => this.renderSalesChart(retryCount + 1), 50);
      }
      return;
    }

    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.salesChartData.data.map(d => d.monthLabel),
        datasets: [
          {
            label: 'Receita (R$)',
            data: this.salesChartData.data.map(d => d.totalRevenue),
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Vendas',
            data: this.salesChartData.data.map(d => d.totalSales),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Receita (R$)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Quantidade de Vendas'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    };

    this.salesChart = new Chart(canvas, config);
  }

  renderTopProductsChart(retryCount: number = 0): void {
    if (!this.topProductsData) return;

    const canvas = this.topProductsChartCanvas?.nativeElement;
    if (!canvas) {
      if (retryCount < 15) {
        setTimeout(() => this.renderTopProductsChart(retryCount + 1), 50);
      }
      return;
    }

    if (this.topProductsChart) {
      this.topProductsChart.destroy();
      this.topProductsChart = null;
    }

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.topProductsData.topProducts.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
        datasets: [
          {
            label: 'Quantidade Vendida',
            data: this.topProductsData.topProducts.map(p => p.quantity),
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderColor: 'rgb(236, 72, 153)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Quantidade'
            }
          }
        }
      }
    };

    this.topProductsChart = new Chart(canvas, config);
  }

  getPaymentMethodsArray(): Array<{ method: string; amount: number }> {
    return this.todayReport?.paymentMethodsArray || [];
  }

  getTotalProductsSold(): number {
    return this.todayReport?.totalProductsSold || 0;
  }

  ngOnDestroy(): void {
    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
      this.topProductsChart = null;
    }
  }
}
