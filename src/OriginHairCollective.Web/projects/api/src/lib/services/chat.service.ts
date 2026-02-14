import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { ChatMessage, ChatStats, Conversation, ConversationSummary, CreateConversationRequest, SendMessageRequest } from '../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/chat`;

  createConversation(request: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/conversations`, request);
  }

  getConversation(id: string, sessionId?: string): Observable<Conversation> {
    let params = new HttpParams();
    if (sessionId) {
      params = params.set('sessionId', sessionId);
    }
    return this.http.get<Conversation>(`${this.baseUrl}/conversations/${id}`, { params });
  }

  sendMessage(conversationId: string, sessionId: string, request: SendMessageRequest): Observable<ChatMessage> {
    const params = new HttpParams().set('sessionId', sessionId);
    return this.http.post<ChatMessage>(`${this.baseUrl}/conversations/${conversationId}/messages`, request, { params });
  }

  getConversations(skip = 0, take = 20): Observable<ConversationSummary[]> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.http.get<ConversationSummary[]>(`${this.baseUrl}/conversations`, { params });
  }

  getStats(): Observable<ChatStats> {
    return this.http.get<ChatStats>(`${this.baseUrl}/conversations/stats`);
  }
}
