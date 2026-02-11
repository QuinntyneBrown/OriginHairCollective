import { Component } from '@angular/core';

@Component({
  selector: 'lib-chat-typing-indicator',
  template: `
    <div class="typing">
      <div class="typing__avatar">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </svg>
      </div>
      <div class="typing__bubble">
        <span class="typing__dot"></span>
        <span class="typing__dot"></span>
        <span class="typing__dot"></span>
      </div>
    </div>
  `,
  styles: `
    .typing {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .typing__avatar {
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

    .typing__bubble {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 14px 20px;
      background: var(--color-bg-secondary);
      border-radius: 2px 14px 14px 14px;
      border: 1px solid var(--color-bg-card);
    }

    .typing__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-gold);
      animation: typingBounce 1.4s ease-in-out infinite;
    }

    .typing__dot:nth-child(1) {
      opacity: 0.4;
      animation-delay: 0s;
    }

    .typing__dot:nth-child(2) {
      opacity: 0.7;
      animation-delay: 0.2s;
    }

    .typing__dot:nth-child(3) {
      opacity: 1;
      animation-delay: 0.4s;
    }

    @keyframes typingBounce {
      0%, 60%, 100% {
        transform: translateY(0);
      }
      30% {
        transform: translateY(-4px);
      }
    }

    @media (max-width: 768px) {
      .typing__avatar {
        width: 28px;
        height: 28px;
        min-width: 28px;
      }

      .typing__bubble {
        border-radius: 2px 16px 16px 16px;
      }
    }
  `,
})
export class ChatTypingIndicatorComponent {}
