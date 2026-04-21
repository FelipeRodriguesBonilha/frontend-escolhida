import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CreateSupplierDto, PaginatedResponse, ReturnSupplierDto, UpdateSupplierDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Suppliers {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createSupplier(supplierData: CreateSupplierDto): Observable<ReturnSupplierDto> {
    return this.http.post<ReturnSupplierDto>(`${this.apiUrl}/suppliers`, supplierData);
  }

  getAllSuppliers(page: number = 1, limit: number = 10, search?: string, showInactive: boolean = false): Observable<PaginatedResponse<ReturnSupplierDto>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (showInactive) params.showInactive = 'true';
    return this.http.get<PaginatedResponse<ReturnSupplierDto>>(`${this.apiUrl}/suppliers`, { params });
  }

  getAllSuppliersDropdown(): Observable<ReturnSupplierDto[]> {
    return this.http.get<PaginatedResponse<ReturnSupplierDto>>(`${this.apiUrl}/suppliers`, { params: { page: 1, limit: 1000 } }).pipe(
      map(r => r.data)
    );
  }

  getSupplierById(id: string): Observable<ReturnSupplierDto> {
    return this.http.get<ReturnSupplierDto>(`${this.apiUrl}/suppliers/${id}`);
  }

  updateSupplier(id: string, supplierData: UpdateSupplierDto): Observable<ReturnSupplierDto> {
    return this.http.patch<ReturnSupplierDto>(`${this.apiUrl}/suppliers/${id}`, supplierData);
  }

  deleteSupplier(id: string): Observable<ReturnSupplierDto> {
    return this.http.delete<ReturnSupplierDto>(`${this.apiUrl}/suppliers/${id}`);
  }

  reactivateSupplier(id: string): Observable<ReturnSupplierDto> {
    return this.http.patch<ReturnSupplierDto>(`${this.apiUrl}/suppliers/${id}/reactivate`, {});
  }

  permanentDeleteSupplier(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/suppliers/${id}/permanent`);
  }
}
