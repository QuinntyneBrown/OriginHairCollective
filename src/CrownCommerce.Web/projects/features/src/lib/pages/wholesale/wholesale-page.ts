import { Component } from '@angular/core';
import { SectionHeaderComponent } from 'components';
import { InquiryFormComponent } from '../../intelligent/inquiry-form/inquiry-form';

@Component({
  selector: 'feat-wholesale-page',
  standalone: true,
  imports: [SectionHeaderComponent, InquiryFormComponent],
  template: `
    <section class="wholesale-page">
      <lib-section-header label="WHOLESALE" heading="Bulk Orders & Partnerships" />
      <p class="wholesale-page__intro">
        Interested in carrying our products in your salon or store?
        We offer competitive wholesale pricing for qualified businesses.
      </p>
      <feat-inquiry-form
        subjectPrefix="[WHOLESALE]"
        [showPhoneField]="true"
        submitLabel="SUBMIT INQUIRY"
      />
    </section>
  `,
  styles: `
    .wholesale-page {
      display: flex; flex-direction: column; align-items: center; gap: 32px;
      padding: 60px 80px; max-width: 600px; margin: 0 auto;
      &__intro {
        font-family: var(--font-body); font-size: 16px; line-height: 1.7;
        color: var(--color-text-secondary); text-align: center;
      }
    }
    @media (max-width: 768px) { .wholesale-page { padding: 40px 24px; } }
  `,
})
export class WholesalePage {}
