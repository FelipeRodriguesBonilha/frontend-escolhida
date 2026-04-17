import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateSaleDto, ReturnSaleDto, SimulateSaleDto } from '../../models';

export interface PaginatedSalesResponse {
  data: ReturnSaleDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class Sales {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createSale(saleData: CreateSaleDto): Observable<ReturnSaleDto> {
    return this.http.post<ReturnSaleDto>(`${this.apiUrl}/sales`, saleData);
  }

  getAllSales(page: number = 1, limit: number = 20, date?: string): Observable<PaginatedSalesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (date) {
      params = params.set('date', date);
    }
    
    return this.http.get<PaginatedSalesResponse>(`${this.apiUrl}/sales`, { params });
  }

  getSaleById(id: string): Observable<ReturnSaleDto> {
    return this.http.get<ReturnSaleDto>(`${this.apiUrl}/sales/${id}`);
  }

  simulateSale(simulateData: SimulateSaleDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/sales/simulate`, simulateData);
  }
}
