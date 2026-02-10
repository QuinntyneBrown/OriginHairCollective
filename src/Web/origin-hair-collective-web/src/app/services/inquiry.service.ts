import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInquiry } from '../models/create-inquiry';

@Injectable({ providedIn: 'root' })
export class InquiryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/inquiries';

  submit(inquiry: CreateInquiry): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/inquiries`, inquiry);
  }
}
