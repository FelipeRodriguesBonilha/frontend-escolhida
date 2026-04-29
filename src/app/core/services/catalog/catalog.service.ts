import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse, ReturnProductDto } from '../../models';

export interface CatalogCategory {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly baseUrl = `${environment.apiUrl}/catalog`;

  constructor(private http: HttpClient) {}

  getProducts(
    page: number = 1,
    limit: number = 50,
    search?: string,
    categoryId?: string,
  ): Observable<PaginatedResponse<ReturnProductDto>> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (search) params['search'] = search;
    if (categoryId) params['categoryId'] = categoryId;
    return this.http.get<PaginatedResponse<ReturnProductDto>>(`${this.baseUrl}/products`, { params });
  }

  getCategories(): Observable<CatalogCategory[]> {
    return this.http.get<CatalogCategory[]>(`${this.baseUrl}/categories`);
  }

  getPublicImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    const filename = imageUrl.replace(/^\/uploads\//, '');
    return `${this.baseUrl}/uploads/${filename}`;
  }
}
