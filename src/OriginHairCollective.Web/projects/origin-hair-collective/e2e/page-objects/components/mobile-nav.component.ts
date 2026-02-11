import { type Locator, type Page } from '@playwright/test';

export class MobileNavComponent {
  readonly overlay: Locator;
  readonly content: Locator;
  readonly logo: Locator;
  readonly closeButton: Locator;
  readonly navLinks: Locator;
  readonly shopNowButton: Locator;

  constructor(private page: Page) {
    this.overlay = page.locator('div.mobile-nav');
    this.content = this.overlay.locator('nav.mobile-nav__content');
    this.logo = this.content.locator('lib-logo');
    this.closeButton = this.content.locator('lib-close-button button');
    this.navLinks = this.content.locator('a.mobile-nav__link');
    this.shopNowButton = this.content.locator('lib-button button');
  }

  async isVisible(): Promise<boolean> {
    return this.overlay.isVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async closeByOverlayClick(): Promise<void> {
    await this.overlay.click({ position: { x: 0, y: 0 }, force: true });
  }

  async getNavLinkTexts(): Promise<string[]> {
    return this.navLinks.allTextContents();
  }

  async getNavLinkHref(label: string): Promise<string | null> {
    const link = this.navLinks.filter({ hasText: label });
    return link.getAttribute('href');
  }

  async clickNavLink(label: string): Promise<void> {
    const link = this.navLinks.filter({ hasText: label });
    await link.click();
  }
}
