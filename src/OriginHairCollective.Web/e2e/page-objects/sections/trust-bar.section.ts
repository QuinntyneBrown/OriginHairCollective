import { type Locator, type Page } from '@playwright/test';

export class TrustBarSection {
  readonly root: Locator;
  readonly trustItems: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.trust-bar');
    this.trustItems = this.root.locator('lib-trust-bar-item');
  }

  async getTrustItemTexts(): Promise<string[]> {
    return this.root.locator('.trust-item__text').allTextContents();
  }

  async getTrustItemCount(): Promise<number> {
    return this.trustItems.count();
  }

  async hasTrustItemIcon(index: number): Promise<boolean> {
    return this.trustItems.nth(index).locator('.trust-item__icon svg').isVisible();
  }
}
