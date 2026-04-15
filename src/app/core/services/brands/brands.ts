import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateBrandDto, ReturnBrandDto, UpdateBrandDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Brands {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createBrand(brandData: CreateBrandDto): Observable<ReturnBrandDto> {
    return this.http.post<ReturnBrandDto>(`${this.apiUrl}/brands`, brandData);
  }

  getAllBrands(): Observable<ReturnBrandDto[]> {
    return this.http.get<ReturnBrandDto[]>(`${this.apiUrl}/brands`);
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
}
