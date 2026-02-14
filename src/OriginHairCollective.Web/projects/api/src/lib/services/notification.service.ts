import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { NotificationLog } from '../models/notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/notifications`;

  getNotifications(): Observable<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(`${this.baseUrl}/notifications`);
  }

  getNotificationsByRecipient(email: string): Observable<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(`${this.baseUrl}/notifications/recipient/${email}`);
  }
}
