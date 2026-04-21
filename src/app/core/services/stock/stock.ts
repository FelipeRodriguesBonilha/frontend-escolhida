import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AdjustStockDto, PaginatedResponse, ReturnStockDto } from "../../models";

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  adjustStock(productId: string, adjustData: AdjustStockDto): Observable<ReturnStockDto> {
    return this.http.post<ReturnStockDto>(`${this.apiUrl}/stock/product/${productId}/adjust`, adjustData);
  }

  getAllStocks(page: number = 1, limit: number = 10, search?: string, showInactive: boolean = false): Observable<PaginatedResponse<ReturnStockDto>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (showInactive) params.showInactive = 'true';
    return this.http.get<PaginatedResponse<ReturnStockDto>>(`${this.apiUrl}/stock`, { params });
  }

  permanentDeleteStockProduct(productId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/stock/product/${productId}/permanent`);
  }

  getLowStock(): Observable<ReturnStockDto[]> {
    return this.http.get<ReturnStockDto[]>(`${this.apiUrl}/stock/low-stock`);
  }

  getStockByProduct(productId: string): Observable<ReturnStockDto> {
    return this.http.get<ReturnStockDto>(`${this.apiUrl}/stock/product/${productId}`);
  }
}
