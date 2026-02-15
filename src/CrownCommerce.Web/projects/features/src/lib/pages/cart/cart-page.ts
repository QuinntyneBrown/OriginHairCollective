import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from 'components';
import { OrderService } from 'api';
import type { CartItem } from 'api';

@Component({
  selector: 'feat-cart-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(true);

  private get sessionId(): string {
    return sessionStorage.getItem('cartSessionId') ?? '';
  }

  ngOnInit(): void {
    if (!this.sessionId) {
      this.loading.set(false);
      return;
    }
    this.orderService.getCart(this.sessionId).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get total(): number {
    return this.items().reduce((sum, item) => sum + item.lineTotal, 0);
  }

  removeItem(itemId: string): void {
    this.orderService.removeCartItem(itemId).subscribe({
      next: () => this.items.update(items => items.filter(i => i.id !== itemId)),
    });
  }

  clearCart(): void {
    this.orderService.clearCart(this.sessionId).subscribe({
      next: () => this.items.set([]),
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }
}
