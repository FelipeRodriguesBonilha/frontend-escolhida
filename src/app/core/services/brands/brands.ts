import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CreateBrandDto, PaginatedResponse, ReturnBrandDto, UpdateBrandDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Brands {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createBrand(brandData: CreateBrandDto): Observable<ReturnBrandDto> {
    return this.http.post<ReturnBrandDto>(`${this.apiUrl}/brands`, brandData);
  }

  getAllBrands(page: number = 1, limit: number = 10, search?: string, showInactive: boolean = false): Observable<PaginatedResponse<ReturnBrandDto>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (showInactive) params.showInactive = 'true';
    return this.http.get<PaginatedResponse<ReturnBrandDto>>(`${this.apiUrl}/brands`, { params });
  }

  getAllBrandsDropdown(): Observable<ReturnBrandDto[]> {
    return this.http.get<PaginatedResponse<ReturnBrandDto>>(`${this.apiUrl}/brands`, { params: { page: 1, limit: 1000 } }).pipe(
      map(r => r.data)
    );
  }

  getBrandById(id: string): Observable<ReturnBrandDto> {
    return this.http.get<ReturnBrandDto>(`${this.apiUrl}/brands/${id}`);
  }

  updateBrand(id: string, brandData: UpdateBrandDto): Observable<ReturnBrandDto> {
    return this.http.patch<ReturnBrandDto>(`${this.apiUrl}/brands/${id}`, brandData);
  }

  deleteBrand(id: string): Observable<ReturnBrandDto> {
    return this.http.delete<ReturnBrandDto>(`${this.apiUrl}/brands/${id}`);
  }

  reactivateBrand(id: string): Observable<ReturnBrandDto> {
    return this.http.patch<ReturnBrandDto>(`${this.apiUrl}/brands/${id}/reactivate`, {});
  }

  permanentDeleteBrand(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/brands/${id}/permanent`);
  }
}
