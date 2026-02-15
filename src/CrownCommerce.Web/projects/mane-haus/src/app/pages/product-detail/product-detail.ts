import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent } from 'components';
import { CatalogService, OrderService } from 'api';
import type { HairProduct } from 'api';
import { CartService } from '../../services/cart.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ButtonComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly product = signal<HairProduct | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly quantity = signal(1);
  readonly addingToCart = signal(false);
  readonly addedToCart = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.catalogService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.title.setTitle(`${product.name} | Mane Haus`);
        this.meta.updateTag({ name: 'description', content: product.description });
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  updateQuantity(value: number): void {
    if (value >= 1 && value <= 99) {
      this.quantity.set(value);
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    this.addingToCart.set(true);
    this.orderService.addToCart(this.cartService.sessionId(), {
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
}
