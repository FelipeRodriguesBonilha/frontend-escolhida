import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateCategoryDto, ReturnCategoryDto, UpdateCategoryDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Categories {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createCategory(categoryData: CreateCategoryDto): Observable<ReturnCategoryDto> {
    return this.http.post<ReturnCategoryDto>(`${this.apiUrl}/categories`, categoryData);
  }

  getAllCategories(): Observable<ReturnCategoryDto[]> {
    return this.http.get<ReturnCategoryDto[]>(`${this.apiUrl}/categories`);
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
}
