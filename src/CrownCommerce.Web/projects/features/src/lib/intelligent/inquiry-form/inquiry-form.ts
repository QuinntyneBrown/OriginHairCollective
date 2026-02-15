import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from 'components';
import { CatalogService, InquiryService } from 'api';
import type { HairProduct } from 'api';

@Component({
  selector: 'feat-inquiry-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent],
  templateUrl: './inquiry-form.html',
  styleUrl: './inquiry-form.scss',
})
export class InquiryFormComponent implements OnInit {
  private readonly inquiryService = inject(InquiryService);
  private readonly catalogService = inject(CatalogService);

  readonly subjectPrefix = input('');
  readonly showPhoneField = input(true);
  readonly submitLabel = input('Send Message');
  readonly showProductField = input(false);

  name = '';
  email = '';
  phone = '';
  message = '';
  productId = '';

  readonly products = signal<HairProduct[]>([]);
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    if (this.showProductField()) {
      this.catalogService.getProducts().subscribe({
        next: (products) => this.products.set(products),
        error: () => {},
      });
    }
  }

  submit(): void {
    if (!this.name || !this.email || !this.message) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const prefix = this.subjectPrefix();
    const msg = prefix ? `${prefix} ${this.message}` : this.message;

    this.inquiryService.createInquiry({
      name: this.name,
      email: this.email,
      phone: this.phone || undefined,
      message: msg,
      productId: this.productId || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Failed to send. Please try again.');
      },
    });
  }
}
