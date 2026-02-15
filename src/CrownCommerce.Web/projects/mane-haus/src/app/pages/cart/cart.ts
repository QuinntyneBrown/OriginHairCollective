import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { OrderService } from 'api';
import type { CartItem } from 'api';
import { CartService } from '../../services/cart.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, ButtonComponent, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartPage implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly cartService = inject(CartService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly cartTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  constructor() {
    this.title.setTitle('Cart | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Your shopping cart.' });
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(false);
    this.orderService.getCart(this.cartService.sessionId()).subscribe({
      next: (items) => {
        this.items.set(items);
        this.cartService.updateItemCount(items.length);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  removeItem(itemId: string): void {
    this.orderService.removeCartItem(itemId).subscribe({
      next: () => {
        this.items.update(items => items.filter(i => i.id !== itemId));
        this.cartService.updateItemCount(this.items().length);
      },
    });
  }

  clearCart(): void {
    this.orderService.clearCart(this.cartService.sessionId()).subscribe({
      next: () => {
        this.items.set([]);
        this.cartService.updateItemCount(0);
      },
    });
  }
}
