import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { CreateOriginRequest, CreateProductRequest, HairOrigin, HairProduct, UpdateOriginRequest, UpdateProductRequest } from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/catalog`;

  getProducts(): Observable<HairProduct[]> {
    return this.http.get<HairProduct[]>(`${this.baseUrl}/products`);
  }

  getProduct(id: string): Observable<HairProduct> {
    return this.http.get<HairProduct>(`${this.baseUrl}/products/${id}`);
  }

  getProductsByOrigin(originId: string): Observable<HairProduct[]> {
    return this.http.get<HairProduct[]>(`${this.baseUrl}/products/by-origin/${originId}`);
  }

  // TODO: Verify backend POST endpoint exists at /api/catalog/products
  createProduct(request: CreateProductRequest): Observable<HairProduct> {
    return this.http.post<HairProduct>(`${this.baseUrl}/products`, request);
  }

  // TODO: Verify backend PUT endpoint exists at /api/catalog/products/{id}
  updateProduct(id: string, request: UpdateProductRequest): Observable<HairProduct> {
    return this.http.put<HairProduct>(`${this.baseUrl}/products/${id}`, request);
  }

  getOrigins(): Observable<HairOrigin[]> {
    return this.http.get<HairOrigin[]>(`${this.baseUrl}/origins`);
  }

  getOrigin(id: string): Observable<HairOrigin> {
    return this.http.get<HairOrigin>(`${this.baseUrl}/origins/${id}`);
  }

  // TODO: Verify backend POST endpoint exists at /api/catalog/origins
  createOrigin(request: CreateOriginRequest): Observable<HairOrigin> {
    return this.http.post<HairOrigin>(`${this.baseUrl}/origins`, request);
  }

  // TODO: Verify backend PUT endpoint exists at /api/catalog/origins/{id}
  updateOrigin(id: string, request: UpdateOriginRequest): Observable<HairOrigin> {
    return this.http.put<HairOrigin>(`${this.baseUrl}/origins/${id}`, request);
  }

  // TODO: Verify backend DELETE endpoint exists at /api/catalog/products/{id}
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }

  // TODO: Verify backend DELETE endpoint exists at /api/catalog/origins/{id}
  deleteOrigin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/origins/${id}`);
  }
}
