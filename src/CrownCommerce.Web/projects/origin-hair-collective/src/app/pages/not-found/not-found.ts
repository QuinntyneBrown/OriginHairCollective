import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from 'components';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonComponent],
  template: `
    <section class="not-found">
      <h1 class="not-found__code">404</h1>
      <h2 class="not-found__title">Page Not Found</h2>
      <p class="not-found__message">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/">
        <lib-button variant="primary" [showArrow]="true">BACK TO HOME</lib-button>
      </a>
    </section>
  `,
  styles: `
    .not-found {
      display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 100px 24px; text-align: center;
      &__code { font-family: var(--font-heading); font-size: 100px; font-weight: 500; color: var(--color-gold); line-height: 1; }
      &__title { font-family: var(--font-heading); font-size: 32px; font-weight: 500; color: var(--color-text-primary); }
      &__message { font-family: var(--font-body); font-size: 16px; color: var(--color-text-secondary); max-width: 400px; }
    }
  `,
})
export class NotFoundPage {}
