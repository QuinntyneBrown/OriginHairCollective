import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { ConfirmPaymentRequest, CreatePaymentRequest, CreateRefundRequest, Payment, Refund } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/payments`;

  createPayment(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, request);
  }

  confirmPayment(id: string, request: ConfirmPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments/${id}/confirm`, request);
  }

  getPayment(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/${id}`);
  }

  getPaymentByOrder(orderId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/payments/order/${orderId}`);
  }

  createRefund(request: CreateRefundRequest): Observable<Refund> {
    return this.http.post<Refund>(`${this.baseUrl}/payments/refunds`, request);
  }
}
