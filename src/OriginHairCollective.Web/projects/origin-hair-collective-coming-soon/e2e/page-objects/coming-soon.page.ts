import { Locator, Page } from '@playwright/test';

export class ComingSoonPage {
  // Header
  readonly logo: Locator;
  readonly logoSubtitle: Locator;

  // Hero
  readonly headline: Locator;
  readonly tagline: Locator;
  readonly badge: Locator;

  // Email signup
  readonly emailForm: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;

  // Footer
  readonly socialLinks: Locator;
  readonly instagramLink: Locator;
  readonly emailLink: Locator;
  readonly handle: Locator;
  readonly copyright: Locator;

  constructor(private page: Page) {
    // Header
    this.logo = page.locator('lib-logo');
    this.logoSubtitle = page.locator('.logo-subtitle');

    // Hero
    this.headline = page.locator('.hero__headline');
    this.tagline = page.locator('.hero__tagline');
    this.badge = page.locator('lib-badge');

    // Email signup
    this.emailForm = page.locator('lib-email-signup form');
    this.emailInput = page.locator('lib-email-signup input[type="email"]');
    this.submitButton = page.locator('lib-email-signup button[type="submit"]');

    // Footer
    this.socialLinks = page.locator('lib-social-icons .social-icons__link');
    this.instagramLink = page.locator('lib-social-icons a[aria-label="instagram"]');
    this.emailLink = page.locator('lib-social-icons a[aria-label="email"]');
    this.handle = page.locator('.footer__handle');
    this.copyright = page.locator('.footer__copyright');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.headline.waitFor({ state: 'visible' });
  }

  async submitEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async getEmailInputValue(): Promise<string> {
    return (await this.emailInput.inputValue()) ?? '';
  }
}
