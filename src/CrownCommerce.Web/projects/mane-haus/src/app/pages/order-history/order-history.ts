import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent } from 'components';
import { OrderService, AuthService } from 'api';
import type { Order } from 'api';

@Component({
  selector: 'app-order-history',
  imports: [RouterLink, DatePipe, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './order-history.html',
  styleUrl: './order-history.scss',
})
export class OrderHistoryPage implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.title.setTitle('Order History | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'View your past orders.' });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const user = this.authService.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set(false);
    this.orderService.getOrdersByUser(user.userId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
