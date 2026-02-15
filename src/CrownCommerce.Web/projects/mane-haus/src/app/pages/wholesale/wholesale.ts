import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { InquiryService } from 'api';

@Component({
  selector: 'app-wholesale',
  imports: [ReactiveFormsModule, ButtonComponent, SectionHeaderComponent],
  templateUrl: './wholesale.html',
  styleUrl: './wholesale.scss',
})
export class WholesalePage {
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
  });

  constructor() {
    this.title.setTitle('Wholesale | Mane Haus');
    this.meta.updateTag({ name: 'description', content: 'Wholesale inquiries for Mane Haus premium hair products.' });
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
      message: `[Wholesale Inquiry] ${value.message}`,
    }).subscribe({
      next: () => {
        this.submitted.set(true);
        this.submitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to send your inquiry. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
