import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CashBleedDto,
  CashRegisterDto,
  CloseCashRegisterDto,
  CreateCashBleedDto,
  OpenCashRegisterDto,
  PaginatedCashRegistersResponse,
} from '../../models/cash-register/cash-register.interface';

@Injectable({
  providedIn: 'root',
})
export class CashRegisterService {
  private readonly apiUrl = `${environment.apiUrl}/cash-register`;

  constructor(private http: HttpClient) {}

  open(dto: OpenCashRegisterDto): Observable<CashRegisterDto> {
    return this.http.post<CashRegisterDto>(`${this.apiUrl}/open`, dto);
  }

  close(id: string, dto: CloseCashRegisterDto): Observable<CashRegisterDto> {
    return this.http.post<CashRegisterDto>(`${this.apiUrl}/${id}/close`, dto);
  }

  bleed(id: string, dto: CreateCashBleedDto): Observable<CashBleedDto> {
    return this.http.post<CashBleedDto>(`${this.apiUrl}/${id}/bleed`, dto);
  }

  getCurrent(): Observable<CashRegisterDto | null> {
    return this.http.get<CashRegisterDto | null>(`${this.apiUrl}/current`);
  }

  getAll(page = 1, limit = 20, date?: string): Observable<PaginatedCashRegistersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (date) params = params.set('date', date);
    return this.http.get<PaginatedCashRegistersResponse>(this.apiUrl, { params });
  }

  getById(id: string): Observable<CashRegisterDto> {
    return this.http.get<CashRegisterDto>(`${this.apiUrl}/${id}`);
  }
}
