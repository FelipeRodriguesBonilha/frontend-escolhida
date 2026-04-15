import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AdjustStockDto, ReturnStockDto } from "../../models";

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  adjustStock(productId: string, adjustData: AdjustStockDto): Observable<ReturnStockDto> {
    return this.http.post<ReturnStockDto>(`${this.apiUrl}/stock/product/${productId}/adjust`, adjustData);
  }

  getAllStocks(): Observable<ReturnStockDto[]> {
    return this.http.get<ReturnStockDto[]>(`${this.apiUrl}/stock`);
  }

  getLowStock(): Observable<ReturnStockDto[]> {
    return this.http.get<ReturnStockDto[]>(`${this.apiUrl}/stock/low-stock`);
  }

  getStockByProduct(productId: string): Observable<ReturnStockDto> {
    return this.http.get<ReturnStockDto>(`${this.apiUrl}/stock/product/${productId}`);
  }
}
