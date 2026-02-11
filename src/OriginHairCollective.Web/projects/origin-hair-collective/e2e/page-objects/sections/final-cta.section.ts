import { type Locator, type Page } from '@playwright/test';

export class FinalCtaSection {
  readonly root: Locator;
  readonly heading: Locator;
  readonly subtext: Locator;
  readonly shopButton: Locator;
  readonly trustText: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.final-cta');
    this.heading = this.root.locator('.final-cta__heading');
    this.subtext = this.root.locator('.final-cta__sub');
    this.shopButton = this.root.locator('lib-button button');
    this.trustText = this.root.locator('.final-cta__trust');
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }

  async getSubtext(): Promise<string | null> {
    return this.subtext.textContent();
  }

  async getTrustText(): Promise<string | null> {
    return this.trustText.textContent();
  }

  async clickShopButton(): Promise<void> {
    await this.shopButton.click();
  }

  async hasArrowOnShopButton(): Promise<boolean> {
    return this.shopButton.locator('svg.btn__arrow').isVisible();
  }
}
