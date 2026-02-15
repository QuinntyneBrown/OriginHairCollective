import { Component, inject, OnInit, signal } from '@angular/core';
import { SectionHeaderComponent } from 'components';
import { ContentService } from 'api';
import { InquiryFormComponent } from '../../intelligent/inquiry-form/inquiry-form';

@Component({
  selector: 'feat-ambassador-page',
  standalone: true,
  imports: [SectionHeaderComponent, InquiryFormComponent],
  template: `
    <section class="ambassador-page">
      <lib-section-header label="JOIN US" heading="Ambassador Program" />
      @if (body()) {
        <div class="ambassador-page__body" [innerHTML]="body()"></div>
      }
      <feat-inquiry-form
        subjectPrefix="[AMBASSADOR APPLICATION]"
        [showPhoneField]="false"
        submitLabel="APPLY NOW"
      />
    </section>
  `,
  styles: `
    .ambassador-page {
      display: flex; flex-direction: column; align-items: center; gap: 32px;
      padding: 60px 80px; max-width: 600px; margin: 0 auto;
      &__body {
        font-family: var(--font-body); font-size: 16px; line-height: 1.8;
        color: var(--color-text-secondary); width: 100%;
      }
    }
    @media (max-width: 768px) { .ambassador-page { padding: 40px 24px; } }
  `,
})
export class AmbassadorPage implements OnInit {
  private readonly contentService = inject(ContentService);
  readonly body = signal('');

  ngOnInit(): void {
    this.contentService.getPage('ambassador-program').subscribe({
      next: (page) => this.body.set(page.body),
      error: () => {},
    });
  }
}
