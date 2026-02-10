import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HairProduct } from '../models/hair-product';
import { HairOrigin } from '../models/hair-origin';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/catalog';

  getOrigins(): Observable<HairOrigin[]> {
    return this.http.get<HairOrigin[]>(`${this.baseUrl}/origins`);
  }

  getProducts(): Observable<HairProduct[]> {
    return this.http.get<HairProduct[]>(`${this.baseUrl}/products`);
  }

  getProductsByOrigin(originId: string): Observable<HairProduct[]> {
    return this.http.get<HairProduct[]>(`${this.baseUrl}/products/by-origin/${originId}`);
  }
}
