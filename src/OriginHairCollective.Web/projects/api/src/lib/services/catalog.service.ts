import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { HairOrigin, HairProduct } from '../models/catalog.models';

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

  getOrigins(): Observable<HairOrigin[]> {
    return this.http.get<HairOrigin[]>(`${this.baseUrl}/origins`);
  }

  getOrigin(id: string): Observable<HairOrigin> {
    return this.http.get<HairOrigin>(`${this.baseUrl}/origins/${id}`);
  }
}
