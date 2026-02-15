import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'components';
import { NewsletterService } from 'api';

@Component({
  selector: 'app-newsletter-signup',
  imports: [FormsModule, ButtonComponent],
  template: `
    <div class="newsletter">
      @if (success()) {
        <p class="newsletter__success">Check your email to confirm your subscription!</p>
      } @else {
        <div class="newsletter__form">
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="Enter your email"
            class="newsletter__input"
          />
          <lib-button variant="primary" size="small" (click)="subscribe()" [disabled]="submitting()">
            {{ submitting() ? 'SUBSCRIBING...' : 'SUBSCRIBE' }}
          </lib-button>
        </div>
        @if (errorMsg()) {
          <p class="newsletter__error">{{ errorMsg() }}</p>
        }
      }
    </div>
  `,
  styles: `
    .newsletter {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .newsletter__form {
      display: flex;
      gap: 12px;
      width: 100%;
      max-width: 480px;
    }

    .newsletter__input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid var(--color-bg-card, #1c1917);
      border-radius: 4px;
      background: var(--color-bg-secondary, #0c0a09);
      color: var(--color-text-primary);
      font-family: var(--font-body);
      font-size: 15px;
      outline: none;

      &:focus {
        border-color: var(--color-gold);
      }

      &::placeholder {
        color: var(--color-text-muted);
      }
    }

    .newsletter__success {
      font-family: var(--font-body);
      font-size: 15px;
      color: var(--color-gold);
    }

    .newsletter__error {
      font-family: var(--font-body);
      font-size: 13px;
      color: var(--color-rose, #e57373);
    }
  `,
})
export class NewsletterSignupComponent {
  private readonly newsletterService = inject(NewsletterService);

  email = '';
  readonly submitting = signal(false);
  readonly success = signal(false);
  readonly errorMsg = signal('');

  subscribe(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMsg.set('Please enter a valid email.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    this.newsletterService.subscribe({ email: this.email }).subscribe({
      next: () => {
        this.success.set(true);
        this.submitting.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to subscribe. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
