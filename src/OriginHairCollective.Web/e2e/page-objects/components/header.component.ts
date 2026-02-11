import { type Locator, type Page } from '@playwright/test';

export class HeaderComponent {
  readonly root: Locator;
  readonly logo: Locator;
  readonly nav: Locator;
  readonly navLinks: Locator;
  readonly shopNowButton: Locator;
  readonly mobileMenuButton: Locator;

  constructor(private page: Page) {
    this.root = page.locator('header.header');
    this.logo = this.root.locator('lib-logo');
    this.nav = this.root.locator('nav.header__nav');
    this.navLinks = this.nav.locator('a.header__link');
    this.shopNowButton = this.nav.locator('lib-button button');
    this.mobileMenuButton = this.root.locator('button.header__menu');
  }

  async getNavLinkByLabel(label: string): Promise<Locator> {
    return this.navLinks.filter({ hasText: label });
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

  async clickShopNow(): Promise<void> {
    await this.shopNowButton.click();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }

  async isNavVisible(): Promise<boolean> {
    return this.nav.isVisible();
  }

  async isMobileMenuButtonVisible(): Promise<boolean> {
    return this.mobileMenuButton.isVisible();
  }
}
