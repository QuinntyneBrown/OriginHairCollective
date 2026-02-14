import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-testimonial-card',
  template: `
    <article class="testimonial-card">
      <span class="testimonial-card__quote-icon">&ldquo;</span>
      <blockquote class="testimonial-card__quote">{{ quote() }}</blockquote>
      <div class="testimonial-card__author">
        <span class="testimonial-card__stars">{{ stars() }}</span>
        <span class="testimonial-card__name">&mdash; {{ author() }}</span>
      </div>
    </article>
  `,
  styles: `
    .testimonial-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 48px 64px;
      border-radius: 20px;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      width: 100%;
      box-sizing: border-box;
    }

    .testimonial-card__quote-icon {
      font-family: var(--font-heading);
      font-size: 80px;
      line-height: 0.5;
      color: var(--color-gold-border);
    }

    .testimonial-card__quote {
      font-family: var(--font-body);
      font-size: 20px;
      font-style: italic;
      line-height: 1.6;
      color: var(--color-text-primary);
      text-align: center;
      margin: 0;
    }

    .testimonial-card__author {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .testimonial-card__stars {
      font-family: var(--font-body);
      font-size: 18px;
      color: var(--color-gold);
    }

    .testimonial-card__name {
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }

    @media (max-width: 768px) {
      .testimonial-card {
        gap: 20px;
        padding: 32px;
      }

      .testimonial-card__quote-icon {
        font-size: 64px;
      }

      .testimonial-card__quote {
        font-size: 16px;
      }

      .testimonial-card__stars {
        font-size: 14px;
      }

      .testimonial-card__name {
        font-size: 13px;
      }
    }
  `,
})
export class TestimonialCardComponent {
  quote = input.required<string>();
  author = input.required<string>();
  stars = input('\u2605 \u2605 \u2605 \u2605 \u2605');
}
