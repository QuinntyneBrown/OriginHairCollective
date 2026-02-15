import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { ProductCardComponent } from 'components';
import { CatalogService } from 'api';
import type { HairProduct } from 'api';

@Component({
  selector: 'feat-product-grid',
  standalone: true,
  imports: [ProductCardComponent],
  template: `
    @if (loading()) {
      <p class="product-grid__status">Loading products...</p>
    } @else if (error()) {
      <p class="product-grid__status product-grid__status--error">{{ error() }}</p>
    } @else if (products().length === 0) {
      <p class="product-grid__status">No products found.</p>
    } @else {
      <div class="product-grid__grid">
        @for (product of products(); track product.id) {
          <lib-product-card
            [imageUrl]="product.imageUrl ?? ''"
            [tag]="product.type.toUpperCase()"
            [title]="product.name"
            [description]="product.description"
            [price]="'$' + product.price + ' CAD'"
            (click)="productClick.emit(product)"
          />
        }
      </div>
    }
  `,
  styles: `
    .product-grid {
      &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }
      &__status {
        font-family: var(--font-body);
        font-size: 16px;
        color: var(--color-text-secondary);
        text-align: center;
        padding: 40px 0;
        &--error { color: var(--color-rose); }
      }
    }
    @media (max-width: 768px) {
      .product-grid__grid { grid-template-columns: 1fr; gap: 16px; }
    }
  `,
})
export class ProductGridComponent implements OnInit {
  private readonly catalogService = inject(CatalogService);

  readonly category = input<string | null>(null);
  readonly maxItems = input<number | null>(null);

  readonly productClick = output<HairProduct>();

  readonly products = signal<HairProduct[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.catalogService.getProducts().subscribe({
      next: (products) => {
        let result = products;
        const cat = this.category();
        if (cat) {
          result = result.filter(p => p.type.toLowerCase() === cat.toLowerCase());
        }
        const max = this.maxItems();
        if (max) {
          result = result.slice(0, max);
        }
        this.products.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.loading.set(false);
      },
    });
  }
}
