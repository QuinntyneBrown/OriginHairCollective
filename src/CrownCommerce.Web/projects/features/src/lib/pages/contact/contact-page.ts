import { Component } from '@angular/core';
import { SectionHeaderComponent } from 'components';
import { InquiryFormComponent } from '../../intelligent/inquiry-form/inquiry-form';

@Component({
  selector: 'feat-contact-page',
  standalone: true,
  imports: [SectionHeaderComponent, InquiryFormComponent],
  template: `
    <section class="contact-page">
      <lib-section-header label="GET IN TOUCH" heading="Contact Us" />
      <feat-inquiry-form
        [showPhoneField]="true"
        [showProductField]="true"
        submitLabel="SEND MESSAGE"
      />
    </section>
  `,
  styles: `
    .contact-page {
      display: flex; flex-direction: column; align-items: center; gap: 32px;
      padding: 60px 80px; max-width: 600px; margin: 0 auto;
    }
    @media (max-width: 768px) { .contact-page { padding: 40px 24px; } }
  `,
})
export class ContactPage {}
