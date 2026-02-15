import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from 'components';
import { CatalogService, OrderService } from 'api';
import type { HairProduct } from 'api';

@Component({
  selector: 'feat-product-detail-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly orderService = inject(OrderService);

  readonly product = signal<HairProduct | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly addedToCart = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.catalogService.getProduct(id).subscribe({
        next: (product) => {
          this.product.set(product);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Product not found.');
          this.loading.set(false);
        },
      });
    }
  }

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    this.addingToCart.set(true);
    const sessionId = sessionStorage.getItem('cartSessionId') ?? crypto.randomUUID();
    sessionStorage.setItem('cartSessionId', sessionId);

    this.orderService.addToCart(sessionId, {
      productId: p.id,
      productName: p.name,
      unitPrice: p.price,
      quantity: this.quantity(),
    }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.addedToCart.set(true);
        setTimeout(() => this.addedToCart.set(false), 3000);
      },
      error: () => {
        this.addingToCart.set(false);
      },
    });
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
