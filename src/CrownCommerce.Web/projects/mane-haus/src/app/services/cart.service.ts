import { Injectable, signal } from '@angular/core';

const SESSION_KEY = 'cart_session_id';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _sessionId = signal<string>(this.loadOrCreateSession());
  readonly sessionId = this._sessionId.asReadonly();

  private readonly _itemCount = signal(0);
  readonly itemCount = this._itemCount.asReadonly();

  updateItemCount(count: number): void {
    this._itemCount.set(count);
  }

  private loadOrCreateSession(): string {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const id = crypto.randomUUID?.() ?? this.fallbackUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  }

  private fallbackUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
