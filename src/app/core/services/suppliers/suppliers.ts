import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateSupplierDto, ReturnSupplierDto, UpdateSupplierDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Suppliers {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createSupplier(supplierData: CreateSupplierDto): Observable<ReturnSupplierDto> {
    return this.http.post<ReturnSupplierDto>(`${this.apiUrl}/suppliers`, supplierData);
  }

  getAllSuppliers(): Observable<ReturnSupplierDto[]> {
    return this.http.get<ReturnSupplierDto[]>(`${this.apiUrl}/suppliers`);
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
}
