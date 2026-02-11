import { Component, input } from '@angular/core';

export interface ChatMessageData {
  sender: 'ai' | 'visitor';
  content: string;
  timestamp: string;
}

@Component({
  selector: 'lib-chat-message',
  template: `
    <div class="message" [class.message--visitor]="sender() === 'visitor'">
      @if (sender() === 'ai') {
        <div class="message__avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
          </svg>
        </div>
      }
      <div
        class="message__bubble"
        [class.message__bubble--ai]="sender() === 'ai'"
        [class.message__bubble--visitor]="sender() === 'visitor'"
      >
        <p class="message__text">{{ content() }}</p>
        <span class="message__time">{{ timestamp() }}</span>
      </div>
    </div>
  `,
  styles: `
    .message {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      width: 100%;
    }

    .message--visitor {
      justify-content: flex-end;
    }

    .message__avatar {
      width: 26px;
      height: 26px;
      min-width: 26px;
      border-radius: 100px;
      background: var(--color-gold);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-bg-primary);
    }

    .message__bubble {
      max-width: 280px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .message__bubble--ai {
      background: var(--color-bg-secondary);
      border-radius: 2px 14px 14px 14px;
      border: 1px solid var(--color-bg-card);
    }

    .message__bubble--visitor {
      background: var(--color-gold);
      border-radius: 14px 2px 14px 14px;
      max-width: 240px;
    }

    .message__text {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }

    .message__bubble--ai .message__text {
      color: var(--color-text-primary);
    }

    .message__bubble--visitor .message__text {
      color: var(--color-bg-primary);
    }

    .message__time {
      font-family: var(--font-body);
      font-size: 10px;
    }

    .message__bubble--ai .message__time {
      color: var(--color-text-muted);
    }

    .message__bubble--visitor .message__time {
      color: rgba(11, 10, 8, 0.5);
      text-align: right;
    }

    @media (max-width: 768px) {
      .message__avatar {
        width: 28px;
        height: 28px;
        min-width: 28px;
      }

      .message__bubble {
        gap: 8px;
        padding: 12px 16px;
      }

      .message__bubble--visitor {
        max-width: 260px;
      }

      .message__text {
        font-size: 14px;
      }

      .message__bubble--ai {
        border-radius: 2px 16px 16px 16px;
      }

      .message__bubble--visitor {
        border-radius: 16px 2px 16px 16px;
      }
    }
  `,
})
export class ChatMessageComponent {
  sender = input.required<'ai' | 'visitor'>();
  content = input.required<string>();
  timestamp = input.required<string>();
}
