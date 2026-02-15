import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { OrderService } from 'api';
import type { Order } from 'api';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, ButtonComponent, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  ngOnInit(): void {
    this.title.setTitle('Order Details | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'View your order details.' });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadOrder(id);
    });
  }

  loadOrder(id?: string): void {
    const orderId = id ?? this.route.snapshot.paramMap.get('id');
    if (!orderId) return;

    this.loading.set(true);
    this.error.set(false);
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
