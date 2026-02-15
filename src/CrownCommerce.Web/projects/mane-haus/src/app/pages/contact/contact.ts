import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { InquiryService } from 'api';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, ButtonComponent, SectionHeaderComponent],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactPage {
  private readonly fb = inject(FormBuilder);
  private readonly inquiryService = inject(InquiryService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required],
    productId: [''],
  });

  constructor() {
    this.title.setTitle('Contact | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Get in touch with Mane Haus. We\'d love to hear from you.' });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const value = this.form.getRawValue();
    this.inquiryService.createInquiry({
      name: value.name!,
      email: value.email!,
      phone: value.phone || undefined,
      message: value.message!,
      productId: value.productId || undefined,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to send your message. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
