import { Component, inject, InjectionToken, OnInit, signal } from '@angular/core';
import { ContentService } from 'api';
import type { ContentPage as ContentPageModel } from 'api';

export const CONTENT_PAGE_SLUG = new InjectionToken<string>('CONTENT_PAGE_SLUG');

@Component({
  selector: 'feat-content-page',
  standalone: true,
  template: `
    @if (loading()) {
      <div class="content-page__loading">Loading...</div>
    } @else if (content()) {
      <article class="content-page">
        <h1 class="content-page__title">{{ content()!.title }}</h1>
        <div class="content-page__body" [innerHTML]="content()!.body"></div>
      </article>
    } @else {
      <p class="content-page__error">Content unavailable.</p>
    }
  `,
  styles: `
    .content-page {
      display: flex; flex-direction: column; align-items: center; gap: 32px;
      padding: 60px 80px; max-width: 800px; margin: 0 auto;
      &__title {
        font-family: var(--font-heading); font-size: 36px; font-weight: 500;
        color: var(--color-text-primary); text-align: center;
      }
      &__body {
        font-family: var(--font-body); font-size: 16px; line-height: 1.8;
        color: var(--color-text-secondary); width: 100%;
      }
      &__loading, &__error {
        font-family: var(--font-body); font-size: 16px; color: var(--color-text-muted);
        text-align: center; padding: 80px;
      }
    }
    @media (max-width: 768px) { .content-page { padding: 40px 24px; } }
  `,
})
export class ContentPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly slug = inject(CONTENT_PAGE_SLUG);

  readonly content = signal<ContentPageModel | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.contentService.getPage(this.slug).subscribe({
      next: (page) => {
        this.content.set(page);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
