import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type {
  Vendor,
  VendorDetail,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorScore,
  SaveScoresRequest,
  VendorRedFlag,
  SaveRedFlagsRequest,
  VendorFollowUp,
  CreateFollowUpRequest,
} from '../models/vendor.models';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/vendors`;

  getVendors(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.baseUrl}/vendors`);
  }

  getVendor(id: string): Observable<VendorDetail> {
    return this.http.get<VendorDetail>(`${this.baseUrl}/vendors/${id}`);
  }

  getVendorsByStatus(status: string): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(`${this.baseUrl}/vendors/by-status/${status}`);
  }

  createVendor(request: CreateVendorRequest): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.baseUrl}/vendors`, request);
  }

  updateVendor(id: string, request: UpdateVendorRequest): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.baseUrl}/vendors/${id}`, request);
  }

  deleteVendor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/vendors/${id}`);
  }

  saveScores(vendorId: string, request: SaveScoresRequest): Observable<VendorScore[]> {
    return this.http.put<VendorScore[]>(`${this.baseUrl}/vendors/${vendorId}/scores`, request);
  }

  saveRedFlags(vendorId: string, request: SaveRedFlagsRequest): Observable<VendorRedFlag[]> {
    return this.http.put<VendorRedFlag[]>(`${this.baseUrl}/vendors/${vendorId}/red-flags`, request);
  }

  sendFollowUp(vendorId: string, request: CreateFollowUpRequest): Observable<VendorFollowUp> {
    return this.http.post<VendorFollowUp>(`${this.baseUrl}/vendors/${vendorId}/follow-ups`, request);
  }

  getFollowUps(vendorId: string): Observable<VendorFollowUp[]> {
    return this.http.get<VendorFollowUp[]>(`${this.baseUrl}/vendors/${vendorId}/follow-ups`);
  }
}
