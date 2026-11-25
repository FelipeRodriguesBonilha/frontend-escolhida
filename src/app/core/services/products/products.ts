import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateProductDto, PaginatedResponse, ReturnProductVariationDto, ReturnProductDto, ReturnProductImageDto, UpdateProductDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class Products {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createProduct(productData: CreateProductDto, images?: File[]): Observable<ReturnProductDto> {
    const formData = this.buildFormData(productData);
    (images ?? []).forEach(img => formData.append('images', img));
    return this.http.post<ReturnProductDto>(`${this.apiUrl}/products`, formData);
  }

  getAllProducts(page: number = 1, limit: number = 20, search?: string, showInactive: boolean = false): Observable<PaginatedResponse<ReturnProductDto>> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (showInactive) params.showInactive = 'true';
    return this.http.get<PaginatedResponse<ReturnProductDto>>(`${this.apiUrl}/products`, { params });
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

  updateProduct(id: string, productData: UpdateProductDto, images?: File[], removeImageIds?: string[]): Observable<ReturnProductDto> {
    const formData = this.buildFormData(productData);
    (images ?? []).forEach(img => formData.append('images', img));
    (removeImageIds ?? []).forEach(id => formData.append('removeImageIds', id));
    return this.http.patch<ReturnProductDto>(`${this.apiUrl}/products/${id}`, formData);
  }

  deleteProduct(id: string): Observable<ReturnProductDto> {
    return this.http.delete<ReturnProductDto>(`${this.apiUrl}/products/${id}`);
  }

  reactivateProduct(id: string): Observable<ReturnProductDto> {
    return this.http.patch<ReturnProductDto>(`${this.apiUrl}/products/${id}/reactivate`, {});
  }

  permanentDeleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}/permanent`);
  }

  addVariation(productId: string, name: string, colorCode?: string, barcode?: string, image?: File): Observable<ReturnProductVariationDto> {
    const formData = new FormData();
    formData.append('name', name);
    if (colorCode) formData.append('colorCode', colorCode);
    if (barcode) formData.append('barcode', barcode);
    if (image) formData.append('image', image);
    return this.http.post<ReturnProductVariationDto>(`${this.apiUrl}/products/${productId}/variations`, formData);
  }

  updateVariation(productId: string, variationId: string, name: string, colorCode?: string, barcode?: string, image?: File, removeImage?: boolean): Observable<ReturnProductVariationDto> {
    const formData = new FormData();
    formData.append('name', name);
    if (colorCode) formData.append('colorCode', colorCode);
    if (barcode) formData.append('barcode', barcode);
    if (image) formData.append('image', image);
    else if (removeImage) formData.append('removeImage', 'true');
    return this.http.patch<ReturnProductVariationDto>(`${this.apiUrl}/products/${productId}/variations/${variationId}`, formData);
  }

  convertVariationFromProduct(productId: string, data: { barcode: string; variationId?: string; name?: string; colorCode?: string; image?: File }): Observable<ReturnProductVariationDto> {
    const formData = new FormData();
    formData.append('barcode', data.barcode);
    if (data.variationId) formData.append('variationId', data.variationId);
    if (data.name) formData.append('name', data.name);
    if (data.colorCode) formData.append('colorCode', data.colorCode);
    if (data.image) formData.append('image', data.image);
    return this.http.post<ReturnProductVariationDto>(`${this.apiUrl}/products/${productId}/variations/convert`, formData);
  }

  removeVariation(productId: string, variationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${productId}/variations/${variationId}`);
  }

  setMainImage(productId: string, imageId: string): Observable<ReturnProductImageDto[]> {
    return this.http.patch<ReturnProductImageDto[]>(`${this.apiUrl}/products/${productId}/images/${imageId}/set-main`, {});
  }

  private buildFormData(data: CreateProductDto | UpdateProductDto): FormData {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (value !== null && value !== undefined && !Array.isArray(value)) {
        formData.append(key, value.toString());
      }
    });
    return formData;
  }
}
