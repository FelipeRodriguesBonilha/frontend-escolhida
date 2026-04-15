import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReturnDailyReportDto, ReturnMonthlyReportDto } from '../../models';

export interface SalesChartData {
  period: string;
  data: Array<{
    month: string;
    monthLabel: string;
    totalSales: number;
    totalRevenue: number;
  }>;
}

export interface TopProductsData {
  period: string;
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    revenue: number;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class Reports {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTodaySummary(): Observable<ReturnDailyReportDto> {
    return this.http.get<ReturnDailyReportDto>(`${this.apiUrl}/reports/today`);
  }

  getDailyReport(date: string): Observable<ReturnDailyReportDto> {
    return this.http.get<ReturnDailyReportDto>(`${this.apiUrl}/reports/daily`, {
      params: { date }
    });
  }

  getMonthlyReport(year: number, month: number): Observable<ReturnMonthlyReportDto> {
    return this.http.get<ReturnMonthlyReportDto>(`${this.apiUrl}/reports/monthly/${year}/${month}`);
  }

  getSalesChartData(period: 'quarter' | 'semester' | 'annual'): Observable<SalesChartData> {
    return this.http.get<SalesChartData>(`${this.apiUrl}/reports/charts/${period}`);
  }

  getTopProductsCurrentMonth(limit: number = 15): Observable<TopProductsData> {
    return this.http.get<TopProductsData>(`${this.apiUrl}/reports/top-products-month`, {
      params: { limit: limit.toString() }
    });
  }
}
