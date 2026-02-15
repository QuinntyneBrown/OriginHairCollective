import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from 'components';
import { OrderService, PaymentService } from 'api';

@Component({
  selector: 'feat-checkout-page',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  customerName = '';
  customerEmail = '';
  shippingAddress = '';

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly orderComplete = signal(false);
  readonly orderId = signal<string | null>(null);

  private get sessionId(): string {
    return sessionStorage.getItem('cartSessionId') ?? '';
  }

  submitOrder(): void {
    if (!this.customerName || !this.customerEmail || !this.shippingAddress) {
      this.error.set('Please fill in all fields.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.orderService.createOrder(this.sessionId, {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      shippingAddress: this.shippingAddress,
    }).subscribe({
      next: (order) => {
        this.paymentService.createPayment({
          orderId: order.id,
          customerEmail: this.customerEmail,
          amount: order.totalAmount,
          paymentMethod: 'card',
        }).subscribe({
          next: (payment) => {
            this.paymentService.confirmPayment(payment.id, { externalTransactionId: `sim_${Date.now()}` }).subscribe({
              next: () => {
                this.submitting.set(false);
                this.orderComplete.set(true);
                this.orderId.set(order.id);
                sessionStorage.removeItem('cartSessionId');
              },
              error: () => {
                this.submitting.set(false);
                this.error.set('Payment confirmation failed. Please contact support.');
              },
            });
          },
          error: () => {
            this.submitting.set(false);
            this.error.set('Payment failed. Please try again.');
          },
        });
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Failed to create order. Please try again.');
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
