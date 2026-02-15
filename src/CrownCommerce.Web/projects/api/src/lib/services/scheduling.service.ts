import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  CalendarEvent,
  ConversationSummary,
  ScheduleConversation,
  CreateConversationRequest,
  SendMessageRequest,
  ConversationMessage,
  Channel,
  ChannelMessage,
  SendChannelMessageRequest,
  CreateChannelRequest,
  MarkAsReadRequest,
  ActivityFeedItem,
  UpdatePresenceRequest,
} from '../models/scheduling.models';

@Injectable({ providedIn: 'root' })
export class SchedulingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/scheduling`;

  // Employees
  getEmployees(status?: string): Observable<Employee[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`, { params });
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  createEmployee(request: CreateEmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, request);
  }

  updateEmployee(id: string, request: UpdateEmployeeRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, request);
  }

  // Meetings
  getMeeting(id: string): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.baseUrl}/meetings/${id}`);
  }

  getCalendarEvents(startUtc: string, endUtc: string, employeeId?: string): Observable<CalendarEvent[]> {
    let params = new HttpParams()
      .set('startUtc', startUtc)
      .set('endUtc', endUtc);
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/meetings/calendar`, { params });
  }

  getUpcomingMeetings(count = 10): Observable<Meeting[]> {
    const params = new HttpParams().set('count', count);
    return this.http.get<Meeting[]>(`${this.baseUrl}/meetings/upcoming`, { params });
  }

  createMeeting(request: CreateMeetingRequest): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.baseUrl}/meetings`, request);
  }

  updateMeeting(id: string, request: UpdateMeetingRequest): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.baseUrl}/meetings/${id}`, request);
  }

  respondToMeeting(meetingId: string, employeeId: string, response: string): Observable<Meeting> {
    return this.http.post<Meeting>(
      `${this.baseUrl}/meetings/${meetingId}/respond/${employeeId}`,
      { response }
    );
  }

  cancelMeeting(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/meetings/${id}/cancel`, null);
  }

  exportMeetingToICal(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/meetings/${id}/ical`, { responseType: 'blob' });
  }

  // Conversations
  getConversations(employeeId?: string): Observable<ConversationSummary[]> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.http.get<ConversationSummary[]>(`${this.baseUrl}/conversations`, { params });
  }

  getConversation(id: string): Observable<ScheduleConversation> {
    return this.http.get<ScheduleConversation>(`${this.baseUrl}/conversations/${id}`);
  }

  createConversation(request: CreateConversationRequest): Observable<ScheduleConversation> {
    return this.http.post<ScheduleConversation>(`${this.baseUrl}/conversations`, request);
  }

  sendMessage(conversationId: string, request: SendMessageRequest): Observable<ConversationMessage> {
    return this.http.post<ConversationMessage>(
      `${this.baseUrl}/conversations/${conversationId}/messages`,
      request
    );
  }

  // Channels
  getChannels(employeeId: string): Observable<Channel[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<Channel[]>(`${this.baseUrl}/channels`, { params });
  }

  getChannelMessages(channelId: string): Observable<ChannelMessage[]> {
    return this.http.get<ChannelMessage[]>(`${this.baseUrl}/channels/${channelId}/messages`);
  }

  sendChannelMessage(channelId: string, request: SendChannelMessageRequest): Observable<ChannelMessage> {
    return this.http.post<ChannelMessage>(`${this.baseUrl}/channels/${channelId}/messages`, request);
  }

  markChannelAsRead(channelId: string, request: MarkAsReadRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/channels/${channelId}/read`, request);
  }

  createChannel(request: CreateChannelRequest): Observable<Channel> {
    return this.http.post<Channel>(`${this.baseUrl}/channels`, request);
  }

  // Activity Feed
  getActivityFeed(employeeId: string, count = 10): Observable<ActivityFeedItem[]> {
    const params = new HttpParams().set('employeeId', employeeId).set('count', count);
    return this.http.get<ActivityFeedItem[]>(`${this.baseUrl}/activity`, { params });
  }

  // Presence
  updatePresence(employeeId: string, request: UpdatePresenceRequest): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${employeeId}/presence`, request);
  }
}
