import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { AddToCartRequest, CartItem, CreateOrderRequest, Order, UpdateOrderStatusRequest } from '../models/order.models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/orders`;

  getCart(sessionId: string): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.baseUrl}/cart/${sessionId}`);
  }

  addToCart(sessionId: string, request: AddToCartRequest): Observable<CartItem> {
    return this.http.post<CartItem>(`${this.baseUrl}/cart/${sessionId}`, request);
  }

  removeCartItem(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cart/items/${itemId}`);
  }

  clearCart(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cart/${sessionId}`);
  }

  createOrder(sessionId: string, request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders/${sessionId}`, request);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${id}`);
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/user/${userId}`);
  }

  updateOrderStatus(id: string, request: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/orders/${id}/status`, request);
  }
}
