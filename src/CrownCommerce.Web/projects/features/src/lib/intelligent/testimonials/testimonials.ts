import { Component, inject, OnInit, signal } from '@angular/core';
import { TestimonialCardComponent } from 'components';
import { ContentService } from 'api';
import type { Testimonial } from 'api';

@Component({
  selector: 'feat-testimonials',
  standalone: true,
  imports: [TestimonialCardComponent],
  template: `
    @for (testimonial of testimonials(); track testimonial.id) {
      <lib-testimonial-card
        [quote]="testimonial.content"
        [author]="testimonial.customerName + (testimonial.customerLocation ? ', ' + testimonial.customerLocation : '')"
      />
    }
    @if (testimonials().length === 0 && !loading()) {
      <p class="testimonials__empty">No testimonials available.</p>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; align-items: center; gap: 32px; }
    .testimonials__empty { font-family: var(--font-body); font-size: 16px; color: var(--color-text-secondary); }
  `,
})
export class TestimonialsComponent implements OnInit {
  private readonly contentService = inject(ContentService);

  readonly testimonials = signal<Testimonial[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.contentService.getTestimonials().subscribe({
      next: (testimonials) => {
        this.testimonials.set(testimonials);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
