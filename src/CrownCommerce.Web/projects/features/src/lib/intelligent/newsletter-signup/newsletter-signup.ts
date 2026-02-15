import { Component, inject, input, signal } from '@angular/core';
import { EmailSignupComponent } from 'components';
import { NewsletterService } from 'api';

@Component({
  selector: 'feat-newsletter-signup',
  standalone: true,
  imports: [EmailSignupComponent],
  template: `
    @if (submitted()) {
      <p class="newsletter-signup__success">You're on the list!</p>
    } @else {
      <lib-email-signup
        [placeholder]="placeholder()"
        [buttonText]="buttonText()"
        (submitted)="onSubmit($event)"
      />
    }
    @if (error()) {
      <p class="newsletter-signup__error">{{ error() }}</p>
    }
  `,
  styles: `
    .newsletter-signup {
      &__success { font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--color-gold); text-align: center; }
      &__error { font-family: var(--font-body); font-size: 14px; color: var(--color-rose); text-align: center; margin-top: 8px; }
    }
  `,
})
export class NewsletterSignupComponent {
  private readonly newsletter = inject(NewsletterService);

  readonly placeholder = input('Enter your email address');
  readonly buttonText = input('SUBSCRIBE');
  readonly tags = input<string[]>([]);

  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit(email: string): void {
    this.newsletter.subscribe({ email, tags: this.tags() }).subscribe({
      next: () => this.submitted.set(true),
      error: () => this.error.set('Something went wrong. Please try again.'),
    });
  }
}
