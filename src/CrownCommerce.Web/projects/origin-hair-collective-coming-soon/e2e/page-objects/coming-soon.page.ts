import { Locator, Page } from '@playwright/test';

export class ComingSoonPage {
  // Header
  readonly logo: Locator;

  // Hero
  readonly headline: Locator;
  readonly subline: Locator;
  readonly badge: Locator;

  // Email signup (newsletter section)
  readonly emailForm: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly newsletterSuccess: Locator;

  // Footer
  readonly socialLinks: Locator;
  readonly instagramLink: Locator;
  readonly emailLink: Locator;
  readonly footerCopy: Locator;

  // Community
  readonly communityHandle: Locator;

  constructor(private page: Page) {
    // Header – scope logo to the <header> so it resolves to a single element
    this.logo = page.locator('header lib-logo');

    // Hero section
    this.headline = page.locator('.hero__headline');
    this.subline = page.locator('.hero__subline');
    this.badge = page.locator('.hero lib-badge');

    // Newsletter email signup
    this.emailForm = page.locator('lib-email-signup form');
    this.emailInput = page.locator('lib-email-signup input[type="email"]');
    this.submitButton = page.locator('lib-email-signup button[type="submit"]');
    this.newsletterSuccess = page.locator('.newsletter__success');

    // Footer – scope social icons to <footer> to avoid ambiguity
    this.socialLinks = page.locator('footer lib-social-icons .social-icons__link');
    this.instagramLink = page.locator('footer lib-social-icons a[aria-label="instagram"]');
    this.emailLink = page.locator('footer lib-social-icons a[aria-label="email"]');
    this.footerCopy = page.locator('.footer__copy');

    // Community section handle
    this.communityHandle = page.locator('.community__handle');
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
