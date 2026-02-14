import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { PagedResult } from '../models/common.models';
import type {
  Campaign,
  CampaignDetail,
  CampaignRecipient,
  CreateCampaignRequest,
  SubscribeRequest,
  SubscribeResponse,
  Subscriber,
  SubscriberStats,
  UpdateCampaignRequest,
} from '../models/newsletter.models';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/newsletters`;

  // Public subscription endpoints
  subscribe(request: SubscribeRequest): Observable<SubscribeResponse> {
    return this.http.post<SubscribeResponse>(`${this.baseUrl}/subscribe`, request);
  }

  confirmSubscription(token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(`${this.baseUrl}/confirm`, { params });
  }

  unsubscribe(token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(`${this.baseUrl}/unsubscribe`, { params });
  }

  // Admin subscriber endpoints
  getSubscribers(options?: { page?: number; pageSize?: number; status?: string; tag?: string }): Observable<PagedResult<Subscriber>> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page);
    if (options?.pageSize) params = params.set('pageSize', options.pageSize);
    if (options?.status) params = params.set('status', options.status);
    if (options?.tag) params = params.set('tag', options.tag);
    return this.http.get<PagedResult<Subscriber>>(`${this.baseUrl}/admin/subscribers`, { params });
  }

  getSubscriberStats(): Observable<SubscriberStats> {
    return this.http.get<SubscriberStats>(`${this.baseUrl}/admin/subscribers/stats`);
  }

  deleteSubscriber(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/subscribers/${id}`);
  }

  // Admin campaign endpoints
  getCampaigns(options?: { page?: number; pageSize?: number; status?: string }): Observable<PagedResult<Campaign>> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page);
    if (options?.pageSize) params = params.set('pageSize', options.pageSize);
    if (options?.status) params = params.set('status', options.status);
    return this.http.get<PagedResult<Campaign>>(`${this.baseUrl}/admin/campaigns`, { params });
  }

  getCampaign(id: string): Observable<CampaignDetail> {
    return this.http.get<CampaignDetail>(`${this.baseUrl}/admin/campaigns/${id}`);
  }

  createCampaign(request: CreateCampaignRequest): Observable<CampaignDetail> {
    return this.http.post<CampaignDetail>(`${this.baseUrl}/admin/campaigns`, request);
  }

  updateCampaign(id: string, request: UpdateCampaignRequest): Observable<CampaignDetail> {
    return this.http.put<CampaignDetail>(`${this.baseUrl}/admin/campaigns/${id}`, request);
  }

  sendCampaign(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/campaigns/${id}/send`, null);
  }

  cancelCampaign(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/campaigns/${id}/cancel`, null);
  }

  getCampaignRecipients(id: string, options?: { page?: number; pageSize?: number; status?: string }): Observable<PagedResult<CampaignRecipient>> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page);
    if (options?.pageSize) params = params.set('pageSize', options.pageSize);
    if (options?.status) params = params.set('status', options.status);
    return this.http.get<PagedResult<CampaignRecipient>>(`${this.baseUrl}/admin/campaigns/${id}/recipients`, { params });
  }
}
