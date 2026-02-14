import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'lib-benefit-card',
  template: `
    <article class="benefit-card">
      <div class="benefit-card__icon-wrap">
        <span class="benefit-card__icon" [innerHTML]="safeIcon()"></span>
      </div>
      <h3 class="benefit-card__title">{{ title() }}</h3>
      <p class="benefit-card__description">{{ description() }}</p>
    </article>
  `,
  styles: `
    .benefit-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 32px;
      border-radius: 16px;
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
    }

    .benefit-card__icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: var(--color-border);
    }

    .benefit-card__icon {
      display: flex;
      align-items: center;
      color: var(--color-gold);
    }

    :host ::ng-deep .benefit-card__icon svg {
      width: 24px;
      height: 24px;
    }

    .benefit-card__title {
      font-family: var(--font-heading);
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
    }

    .benefit-card__description {
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.6;
      color: var(--color-text-secondary);
      margin: 0;
    }

    @media (max-width: 768px) {
      .benefit-card {
        gap: 14px;
        padding: 24px;
      }

      .benefit-card__icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      :host ::ng-deep .benefit-card__icon svg {
        width: 22px;
        height: 22px;
      }

      .benefit-card__title {
        font-size: 18px;
      }

      .benefit-card__description {
        font-size: 14px;
      }
    }
  `,
})
export class BenefitCardComponent {
  private sanitizer = inject(DomSanitizer);

  iconSvg = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();

  safeIcon = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.iconSvg()));
}
