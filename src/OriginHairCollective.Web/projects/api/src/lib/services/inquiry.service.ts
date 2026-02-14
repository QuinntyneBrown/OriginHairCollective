import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { CreateInquiryRequest, Inquiry } from '../models/inquiry.models';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/inquiries`;

  createInquiry(request: CreateInquiryRequest): Observable<Inquiry> {
    return this.http.post<Inquiry>(`${this.baseUrl}/inquiries`, request);
  }

  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.baseUrl}/inquiries`);
  }
}
