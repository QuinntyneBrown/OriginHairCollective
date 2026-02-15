import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { InquiryService } from 'api';

@Component({
  selector: 'app-wholesale',
  imports: [FormsModule, ButtonComponent, SectionHeaderComponent],
  template: `
    <section class="wholesale">
      <lib-section-header label="WHOLESALE" heading="Bulk Orders & Partnerships" />
      <p class="wholesale__intro">
        Interested in carrying Origin Hair Collective in your salon or store?
        We offer competitive wholesale pricing for qualified businesses.
      </p>

      @if (submitted()) {
        <div class="wholesale__success">
          <h2>Inquiry Received!</h2>
          <p>Our wholesale team will contact you within 48 hours.</p>
        </div>
      } @else {
        <form class="wholesale__form" (ngSubmit)="submit()">
          @if (error()) { <p class="wholesale__error">{{ error() }}</p> }
          <div class="wholesale__field">
            <label class="wholesale__label">Business Name *</label>
            <input class="wholesale__input" type="text" [(ngModel)]="name" name="name" required />
          </div>
          <div class="wholesale__field">
            <label class="wholesale__label">Email *</label>
            <input class="wholesale__input" type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="wholesale__field">
            <label class="wholesale__label">Phone</label>
            <input class="wholesale__input" type="tel" [(ngModel)]="phone" name="phone" />
          </div>
          <div class="wholesale__field">
            <label class="wholesale__label">Tell us about your business *</label>
            <textarea class="wholesale__textarea" [(ngModel)]="message" name="message" rows="4" required></textarea>
          </div>
          <lib-button variant="primary" type="submit">
            @if (submitting()) { SENDING... } @else { SUBMIT INQUIRY }
          </lib-button>
        </form>
      }
    </section>
  `,
  styles: `
    .wholesale {
      display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 60px 80px; max-width: 600px; margin: 0 auto;
      &__intro { font-family: var(--font-body); font-size: 16px; line-height: 1.7; color: var(--color-text-secondary); text-align: center; }
      &__success { text-align: center; padding: 40px 0;
        h2 { font-family: var(--font-heading); font-size: 28px; color: var(--color-gold); }
        p { font-family: var(--font-body); font-size: 16px; color: var(--color-text-secondary); margin-top: 12px; }
      }
      &__error { font-family: var(--font-body); font-size: 14px; color: var(--color-rose); width: 100%; }
      &__form { display: flex; flex-direction: column; gap: 20px; width: 100%; }
      &__field { display: flex; flex-direction: column; gap: 6px; }
      &__label { font-family: var(--font-body); font-size: 13px; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
      &__input, &__textarea {
        background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 8px;
        padding: 14px 16px; font-family: var(--font-body); font-size: 15px; color: var(--color-text-primary); outline: none;
        &:focus { border-color: var(--color-gold); }
      }
      &__textarea { resize: vertical; }
    }
    @media (max-width: 768px) { .wholesale { padding: 40px 24px; } }
  `,
})
export class WholesalePage {
  private readonly inquiryService = inject(InquiryService);
  name = ''; email = ''; phone = ''; message = '';
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (!this.name || !this.email || !this.message) { this.error.set('Please fill in all required fields.'); return; }
    this.submitting.set(true);
    this.error.set(null);
    this.inquiryService.createInquiry({ name: this.name, email: this.email, phone: this.phone || undefined, message: `[WHOLESALE] ${this.message}` }).subscribe({
      next: () => { this.submitting.set(false); this.submitted.set(true); },
      error: () => { this.submitting.set(false); this.error.set('Failed to send. Please try again.'); },
    });
  }
}
