import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-product-card',
  imports: [NgClass],
  template: `
    <article class="product-card">
      <div class="product-card__image">
        @if (imageUrl()) {
          <img [src]="imageUrl()" [alt]="title()" />
        }
      </div>
      <div class="product-card__content">
        <span
          class="product-card__tag"
          [ngClass]="{ 'product-card__tag--alt': tagColor() === 'rose' }"
        >
          {{ tag() }}
        </span>
        <h3 class="product-card__title">{{ title() }}</h3>
        <p class="product-card__description">{{ description() }}</p>
        <span
          class="product-card__price"
          [ngClass]="{ 'product-card__price--alt': tagColor() === 'rose' }"
        >
          {{ price() }}
        </span>
      </div>
    </article>
  `,
  styles: `
    .product-card {
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      background: var(--color-bg-secondary);
      width: 100%;
    }

    .product-card__image {
      width: 100%;
      height: 280px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .product-card__content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 24px;
    }

    .product-card__tag {
      font-family: var(--font-body);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: var(--color-gold);
      text-transform: uppercase;

      &--alt {
        color: var(--color-rose);
      }
    }

    .product-card__title {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.3px;
      color: var(--color-text-primary);
      margin: 0;
    }

    .product-card__description {
      font-family: var(--font-body);
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .product-card__price {
      font-family: var(--font-body);
      font-size: 15px;
      font-weight: 600;
      color: var(--color-gold);

      &--alt {
        color: var(--color-rose);
      }
    }

    @media (max-width: 768px) {
      .product-card__image {
        height: 220px;
      }

      .product-card__content {
        gap: 10px;
        padding: 20px;
      }

      .product-card__title {
        font-size: 22px;
      }

      .product-card__description {
        font-size: 13px;
        line-height: 1.5;
      }

      .product-card__price {
        font-size: 14px;
      }
    }
  `,
})
export class ProductCardComponent {
  imageUrl = input<string>('');
  tag = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  price = input.required<string>();
  tagColor = input<'gold' | 'rose'>('gold');
}
