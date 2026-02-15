import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, SectionHeaderComponent } from 'components';
import { ContentService, InquiryService } from 'api';

@Component({
  selector: 'app-ambassador',
  imports: [FormsModule, ButtonComponent, SectionHeaderComponent],
  template: `
    <section class="ambassador">
      <lib-section-header label="JOIN US" heading="Ambassador Program" />
      @if (body()) {
        <div class="ambassador__body" [innerHTML]="body()"></div>
      }

      @if (submitted()) {
        <div class="ambassador__success">
          <h2>Application Received!</h2>
          <p>We'll review your application and get back to you soon.</p>
        </div>
      } @else {
        <form class="ambassador__form" (ngSubmit)="submit()">
          @if (error()) { <p class="ambassador__error">{{ error() }}</p> }
          <div class="ambassador__field">
            <label class="ambassador__label">Name *</label>
            <input class="ambassador__input" type="text" [(ngModel)]="name" name="name" required />
          </div>
          <div class="ambassador__field">
            <label class="ambassador__label">Email *</label>
            <input class="ambassador__input" type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="ambassador__field">
            <label class="ambassador__label">Tell us why you'd be a great ambassador *</label>
            <textarea class="ambassador__textarea" [(ngModel)]="message" name="message" rows="4" required></textarea>
          </div>
          <lib-button variant="primary" type="submit">
            @if (submitting()) { SENDING... } @else { APPLY NOW }
          </lib-button>
        </form>
      }
    </section>
  `,
  styles: `
    .ambassador {
      display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 60px 80px; max-width: 600px; margin: 0 auto;
      &__body { font-family: var(--font-body); font-size: 16px; line-height: 1.8; color: var(--color-text-secondary); width: 100%; }
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
    @media (max-width: 768px) { .ambassador { padding: 40px 24px; } }
  `,
})
export class AmbassadorPage implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly inquiryService = inject(InquiryService);
  readonly body = signal('');
  name = ''; email = ''; message = '';
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.contentService.getPage('ambassador-program').subscribe({
      next: (page) => this.body.set(page.body),
      error: () => {},
    });
  }

  submit(): void {
    if (!this.name || !this.email || !this.message) { this.error.set('Please fill in all required fields.'); return; }
    this.submitting.set(true);
    this.error.set(null);
    this.inquiryService.createInquiry({ name: this.name, email: this.email, message: `[AMBASSADOR APPLICATION] ${this.message}` }).subscribe({
      next: () => { this.submitting.set(false); this.submitted.set(true); },
      error: () => { this.submitting.set(false); this.error.set('Failed to submit. Please try again.'); },
    });
  }
}
