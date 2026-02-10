import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InquiryService } from '../../services/inquiry.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="contact" id="contact">
      <h2>Get In Touch</h2>
      <p class="section-subtitle">Have questions? Interested in our products? We'd love to hear from you.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="contact-form">
        <div class="form-group">
          <label for="name">Name *</label>
          <input id="name" formControlName="name" placeholder="Your full name" />
          <span class="error" *ngIf="form.get('name')?.touched && form.get('name')?.invalid">
            Name is required
          </span>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input id="email" type="email" formControlName="email" placeholder="your@email.com" />
          <span class="error" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
            A valid email is required
          </span>
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input id="phone" formControlName="phone" placeholder="(optional)" />
        </div>

        <div class="form-group">
          <label for="message">Message *</label>
          <textarea id="message" formControlName="message" rows="5"
            placeholder="Tell us what you're looking for..."></textarea>
          <span class="error" *ngIf="form.get('message')?.touched && form.get('message')?.invalid">
            Message is required
          </span>
        </div>

        <button type="submit" [disabled]="form.invalid || submitting">
          {{ submitting ? 'Sending...' : 'Send Message' }}
        </button>

        <div class="success-message" *ngIf="submitted">
          Thank you! Your inquiry has been submitted. We'll be in touch soon.
        </div>

        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </form>
    </section>
  `,
  styles: `
    .contact {
      padding: 4rem 2rem;
      max-width: 600px;
      margin: 0 auto;
      text-align: center;
    }
    h2 {
      font-family: 'Georgia', serif;
      font-size: 2.5rem;
      color: #3b1f0b;
      margin-bottom: 0.5rem;
    }
    .section-subtitle {
      color: #6b3a1f;
      margin-bottom: 2rem;
    }
    .contact-form { text-align: left; }
    .form-group {
      margin-bottom: 1.2rem;
    }
    label {
      display: block;
      margin-bottom: 0.4rem;
      color: #3b1f0b;
      font-weight: 600;
      font-size: 0.95rem;
    }
    input, textarea {
      width: 100%;
      padding: 0.8rem;
      border: 2px solid #e8ddd0;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
      font-family: inherit;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #d4a85c;
    }
    .error {
      color: #c44;
      font-size: 0.85rem;
      margin-top: 0.3rem;
      display: block;
    }
    button {
      width: 100%;
      padding: 1rem;
      background: #d4a85c;
      color: #3b1f0b;
      border: none;
      border-radius: 6px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.3s;
    }
    button:hover:not(:disabled) { background: #e8c580; }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .success-message {
      margin-top: 1rem;
      padding: 1rem;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 6px;
    }
    .error-message {
      margin-top: 1rem;
      padding: 1rem;
      background: #fce4ec;
      color: #c62828;
      border-radius: 6px;
    }
  `,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inquiryService = inject(InquiryService);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required],
  });

  submitting = false;
  submitted = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting = true;
    this.submitted = false;
    this.errorMessage = '';

    const value = this.form.value;
    this.inquiryService
      .submit({
        name: value.name!,
        email: value.email!,
        phone: value.phone || null,
        message: value.message!,
        productId: null,
      })
      .subscribe({
        next: () => {
          this.submitted = true;
          this.submitting = false;
          this.form.reset();
        },
        error: () => {
          this.errorMessage = 'Something went wrong. Please try again.';
          this.submitting = false;
        },
      });
  }
}
