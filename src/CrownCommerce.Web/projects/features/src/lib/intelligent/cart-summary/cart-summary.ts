import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ButtonComponent } from 'components';
import { OrderService } from 'api';
import type { CartItem } from 'api';

@Component({
  selector: 'feat-cart-summary',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    @if (loading()) {
      <p class="cart-summary__status">Loading cart...</p>
    } @else if (items().length === 0) {
      <p class="cart-summary__status">Your cart is empty.</p>
    } @else {
      <div class="cart-summary__items">
        @for (item of items(); track item.id) {
          <div class="cart-summary__item">
            <div class="cart-summary__item-info">
              <span class="cart-summary__item-name">{{ item.productName }}</span>
              <span class="cart-summary__item-qty">x{{ item.quantity }}</span>
            </div>
            <div class="cart-summary__item-actions">
              <span class="cart-summary__item-total">\${{ item.lineTotal.toFixed(2) }}</span>
              <button class="cart-summary__remove" (click)="removeItem(item.id)">Remove</button>
            </div>
          </div>
        }
      </div>
      <div class="cart-summary__footer">
        <span class="cart-summary__total">Total: \${{ total.toFixed(2) }} CAD</span>
        <lib-button variant="secondary" (click)="clearAll()">Clear Cart</lib-button>
      </div>
    }
  `,
  styles: `
    .cart-summary {
      &__status { font-family: var(--font-body); font-size: 14px; color: var(--color-text-secondary); }
      &__items { display: flex; flex-direction: column; gap: 12px; }
      &__item {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 16px; background: var(--color-bg-secondary); border-radius: 8px;
      }
      &__item-info { display: flex; gap: 8px; align-items: center; }
      &__item-name { font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--color-text-primary); }
      &__item-qty { font-family: var(--font-body); font-size: 13px; color: var(--color-text-muted); }
      &__item-actions { display: flex; gap: 12px; align-items: center; }
      &__item-total { font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
      &__remove {
        background: none; border: none; font-family: var(--font-body); font-size: 12px;
        color: var(--color-rose); cursor: pointer;
      }
      &__footer {
        display: flex; justify-content: space-between; align-items: center;
        margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border);
      }
      &__total { font-family: var(--font-body); font-size: 16px; font-weight: 700; color: var(--color-gold); }
    }
  `,
})
export class CartSummaryComponent implements OnInit {
  private readonly orderService = inject(OrderService);

  readonly sessionId = input('');

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(true);

  get total(): number {
    return this.items().reduce((sum, item) => sum + item.lineTotal, 0);
  }

  ngOnInit(): void {
    const sid = this.sessionId();
    if (!sid) {
      this.loading.set(false);
      return;
    }
    this.orderService.getCart(sid).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  removeItem(itemId: string): void {
    this.orderService.removeCartItem(itemId).subscribe({
      next: () => this.items.update(items => items.filter(i => i.id !== itemId)),
    });
  }

  clearAll(): void {
    const sid = this.sessionId();
    if (!sid) return;
    this.orderService.clearCart(sid).subscribe({
      next: () => this.items.set([]),
    });
  }
}
