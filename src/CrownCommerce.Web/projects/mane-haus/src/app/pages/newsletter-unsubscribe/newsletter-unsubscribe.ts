import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NewsletterService } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-newsletter-unsubscribe',
  imports: [LoadingSpinnerComponent],
  template: `
    <section class="newsletter-page">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (success()) {
        <h1>Unsubscribed</h1>
        <p>You have been successfully unsubscribed from the Mane Haus newsletter.</p>
      } @else {
        <h1>Unsubscribe Failed</h1>
        <p>{{ errorMsg() }}</p>
      }
    </section>
  `,
  styles: `
    .newsletter-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 80px;
      text-align: center;

      h1 {
        font-family: var(--font-heading);
        font-size: 32px;
        font-weight: 500;
        color: var(--color-text-primary);
      }

      p {
        font-family: var(--font-body);
        font-size: 16px;
        color: var(--color-text-secondary);
      }
    }
  `,
})
export class NewsletterUnsubscribePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsletterService = inject(NewsletterService);
  private readonly title = inject(Title);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly errorMsg = signal('Invalid or expired unsubscribe link.');

  ngOnInit(): void {
    this.title.setTitle('Unsubscribe | Mane Haus');

    this.route.queryParamMap.subscribe(params => {
      const token = params.get('token');
      if (!token) {
        this.loading.set(false);
        return;
      }

      this.newsletterService.unsubscribe(token).subscribe({
        next: () => {
          this.success.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
    });
  }
}
