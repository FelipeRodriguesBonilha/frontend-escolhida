import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateProductDto, ReturnProductDto, UpdateProductDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createProduct(productData: CreateProductDto, image?: File): Observable<ReturnProductDto> {
    const formData = this.buildFormData(productData, image);
    return this.http.post<ReturnProductDto>(`${this.apiUrl}/products`, formData);
  }

  getAllProducts(search?: string): Observable<ReturnProductDto[]> {
    const options = search ? { params: { search } } : {};
    return this.http.get<ReturnProductDto[]>(`${this.apiUrl}/products`, options);
  }

  getLowStockProducts(): Observable<ReturnProductDto[]> {
    return this.http.get<ReturnProductDto[]>(`${this.apiUrl}/products/low-stock`);
  }

  getProductByBarcode(barcode: string): Observable<ReturnProductDto> {
    return this.http.get<ReturnProductDto>(`${this.apiUrl}/products/barcode/${barcode}`);
  }

  getProductById(id: string): Observable<ReturnProductDto> {
    return this.http.get<ReturnProductDto>(`${this.apiUrl}/products/${id}`);
  }

  updateProduct(id: string, productData: UpdateProductDto, image?: File): Observable<ReturnProductDto> {
    const formData = this.buildFormData(productData, image);
    return this.http.patch<ReturnProductDto>(`${this.apiUrl}/products/${id}`, formData);
  }

  deleteProduct(id: string): Observable<ReturnProductDto> {
    return this.http.delete<ReturnProductDto>(`${this.apiUrl}/products/${id}`);
  }

  private buildFormData(data: CreateProductDto | UpdateProductDto, image?: File): FormData {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    if (image) {
      formData.append('image', image);
    }
    
    return formData;
  }
}
