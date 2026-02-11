import { type Locator, type Page } from '@playwright/test';

export class TestimonialsSection {
  readonly root: Locator;
  readonly sectionLabel: Locator;
  readonly testimonialCard: Locator;
  readonly quoteIcon: Locator;
  readonly quote: Locator;
  readonly stars: Locator;
  readonly authorName: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.testimonials');
    this.sectionLabel = this.root.locator('.section-label');
    this.testimonialCard = this.root.locator('lib-testimonial-card');
    this.quoteIcon = this.testimonialCard.locator('.testimonial-card__quote-icon');
    this.quote = this.testimonialCard.locator('.testimonial-card__quote');
    this.stars = this.testimonialCard.locator('.testimonial-card__stars');
    this.authorName = this.testimonialCard.locator('.testimonial-card__name');
  }

  async getLabelText(): Promise<string | null> {
    return this.sectionLabel.textContent();
  }

  async getQuoteText(): Promise<string | null> {
    return this.quote.textContent();
  }

  async getAuthorText(): Promise<string | null> {
    return this.authorName.textContent();
  }

  async getStarsText(): Promise<string | null> {
    return this.stars.textContent();
  }

  async hasQuoteIcon(): Promise<boolean> {
    return this.quoteIcon.isVisible();
  }
}
