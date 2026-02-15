import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { OrderService, PaymentService, AuthService } from 'api';
import type { CartItem } from 'api';
import { CartService } from '../../services/cart.service';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner';
import { ErrorStateComponent } from '../../components/error-state/error-state';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, ButtonComponent, SectionHeaderComponent, LoadingSpinnerComponent, ErrorStateComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly cartTotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  readonly form = this.fb.group({
    customerName: ['', Validators.required],
    customerEmail: ['', [Validators.required, Validators.email]],
    shippingAddress: ['', Validators.required],
    paymentMethod: ['card', Validators.required],
  });

  constructor() {
    this.title.setTitle('Checkout | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Complete your Mane Haus order.' });
  }

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.form.patchValue({
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
      });
    }

    this.orderService.getCart(this.cartService.sessionId()).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();
    const user = this.authService.user();

    this.orderService.createOrder(this.cartService.sessionId(), {
      customerName: value.customerName!,
      customerEmail: value.customerEmail!,
      shippingAddress: value.shippingAddress!,
      userId: user?.userId,
    }).pipe(
      switchMap((order) =>
        this.paymentService.createPayment({
          orderId: order.id,
          customerEmail: value.customerEmail!,
          amount: order.totalAmount,
          paymentMethod: value.paymentMethod!,
        }).pipe(
          switchMap((payment) =>
            this.paymentService.confirmPayment(payment.id, {
              externalTransactionId: `txn_${Date.now()}`,
            })
          ),
          switchMap(() => {
            this.cartService.updateItemCount(0);
            this.router.navigate(['/order', order.id]);
            return [];
          }),
        )
      ),
    ).subscribe({
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Order failed. Please try again.');
      },
    });
  }
}
