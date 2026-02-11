import { type Locator, type Page } from '@playwright/test';

export class BrandStorySection {
  readonly root: Locator;
  readonly sectionHeader: Locator;
  readonly label: Locator;
  readonly heading: Locator;
  readonly divider: Locator;
  readonly body: Locator;
  readonly emphasis: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.brand-story');
    this.sectionHeader = this.root.locator('lib-section-header');
    this.label = this.sectionHeader.locator('.section-header__label');
    this.heading = this.sectionHeader.locator('.section-header__heading');
    this.divider = this.root.locator('lib-divider');
    this.body = this.root.locator('.brand-story__body');
    this.emphasis = this.root.locator('.brand-story__emphasis');
  }

  async getLabelText(): Promise<string | null> {
    return this.label.textContent();
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }

  async getBodyText(): Promise<string | null> {
    return this.body.textContent();
  }

  async getEmphasisText(): Promise<string | null> {
    return this.emphasis.textContent();
  }

  async hasAccentDivider(): Promise<boolean> {
    return this.divider.locator('hr.divider--accent').isVisible();
  }
}
