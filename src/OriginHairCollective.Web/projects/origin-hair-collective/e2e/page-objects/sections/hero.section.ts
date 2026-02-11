import { type Locator, type Page } from '@playwright/test';

export class HeroSection {
  readonly root: Locator;
  readonly badge: Locator;
  readonly badgeText: Locator;
  readonly badgeDot: Locator;
  readonly headline: Locator;
  readonly subline: Locator;
  readonly ctaRow: Locator;
  readonly shopCollectionButton: Locator;
  readonly ourStoryButton: Locator;
  readonly heroImage: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.hero');
    this.badge = this.root.locator('lib-badge');
    this.badgeText = this.badge.locator('.badge__text');
    this.badgeDot = this.badge.locator('.badge__dot');
    this.headline = this.root.locator('h1.hero__headline');
    this.subline = this.root.locator('p.hero__subline');
    this.ctaRow = this.root.locator('.hero__cta-row');
    this.shopCollectionButton = this.ctaRow.locator('lib-button').first().locator('button');
    this.ourStoryButton = this.ctaRow.locator('lib-button').nth(1).locator('button');
    this.heroImage = this.root.locator('.hero__image');
  }

  async getHeadlineText(): Promise<string | null> {
    return this.headline.textContent();
  }

  async getSublineText(): Promise<string | null> {
    return this.subline.textContent();
  }

  async getBadgeText(): Promise<string | null> {
    return this.badgeText.textContent();
  }

  async clickShopCollection(): Promise<void> {
    await this.shopCollectionButton.click();
  }

  async clickOurStory(): Promise<void> {
    await this.ourStoryButton.click();
  }

  async hasArrowOnShopButton(): Promise<boolean> {
    return this.shopCollectionButton.locator('svg.btn__arrow').isVisible();
  }
}
