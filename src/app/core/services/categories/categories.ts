import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { CreateCategoryDto, PaginatedResponse, ReturnCategoryDto, UpdateCategoryDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Categories {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createCategory(categoryData: CreateCategoryDto): Observable<ReturnCategoryDto> {
    return this.http.post<ReturnCategoryDto>(`${this.apiUrl}/categories`, categoryData);
  }

  getAllCategories(page: number = 1, limit: number = 10, search?: string, showInactive: boolean = false): Observable<PaginatedResponse<ReturnCategoryDto>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (showInactive) params.showInactive = 'true';
    return this.http.get<PaginatedResponse<ReturnCategoryDto>>(`${this.apiUrl}/categories`, { params });
  }

  getAllCategoriesDropdown(): Observable<ReturnCategoryDto[]> {
    return this.http.get<PaginatedResponse<ReturnCategoryDto>>(`${this.apiUrl}/categories`, { params: { page: 1, limit: 1000 } }).pipe(
      map(r => r.data)
    );
  }

  getCategoryById(id: string): Observable<ReturnCategoryDto> {
    return this.http.get<ReturnCategoryDto>(`${this.apiUrl}/categories/${id}`);
  }

  updateCategory(id: string, categoryData: UpdateCategoryDto): Observable<ReturnCategoryDto> {
    return this.http.patch<ReturnCategoryDto>(`${this.apiUrl}/categories/${id}`, categoryData);
  }

  deleteCategory(id: string): Observable<ReturnCategoryDto> {
    return this.http.delete<ReturnCategoryDto>(`${this.apiUrl}/categories/${id}`);
  }

  reactivateCategory(id: string): Observable<ReturnCategoryDto> {
    return this.http.patch<ReturnCategoryDto>(`${this.apiUrl}/categories/${id}/reactivate`, {});
  }

  permanentDeleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/categories/${id}/permanent`);
  }
}
