import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreatePaymentMethodDto, ReturnPaymentMethodDto, UpdatePaymentMethodDto } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethods {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createPaymentMethod(paymentData: CreatePaymentMethodDto): Observable<ReturnPaymentMethodDto> {
    return this.http.post<ReturnPaymentMethodDto>(`${this.apiUrl}/payment-methods`, paymentData);
  }

  getAllPaymentMethods(): Observable<ReturnPaymentMethodDto[]> {
    return this.http.get<ReturnPaymentMethodDto[]>(`${this.apiUrl}/payment-methods`);
  }

  getPaymentMethodById(id: string): Observable<ReturnPaymentMethodDto> {
    return this.http.get<ReturnPaymentMethodDto>(`${this.apiUrl}/payment-methods/${id}`);
  }

  updatePaymentMethod(id: string, paymentData: UpdatePaymentMethodDto): Observable<ReturnPaymentMethodDto> {
    return this.http.patch<ReturnPaymentMethodDto>(`${this.apiUrl}/payment-methods/${id}`, paymentData);
  }

  deletePaymentMethod(id: string): Observable<ReturnPaymentMethodDto> {
    return this.http.delete<ReturnPaymentMethodDto>(`${this.apiUrl}/payment-methods/${id}`);
  }
}
