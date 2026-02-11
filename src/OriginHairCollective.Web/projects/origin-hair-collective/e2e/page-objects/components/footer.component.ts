import { type Locator, type Page } from '@playwright/test';

export class FooterComponent {
  readonly root: Locator;
  readonly logo: Locator;
  readonly tagline: Locator;
  readonly socialIcons: Locator;
  readonly socialLinks: Locator;
  readonly linkColumns: Locator;
  readonly copyright: Locator;
  readonly location: Locator;
  readonly divider: Locator;

  constructor(private page: Page) {
    this.root = page.locator('footer.footer');
    this.logo = this.root.locator('.footer__brand lib-logo');
    this.tagline = this.root.locator('.footer__tagline');
    this.socialIcons = this.root.locator('lib-social-icons');
    this.socialLinks = this.root.locator('lib-social-icons a.social-icons__link');
    this.linkColumns = this.root.locator('lib-footer-link-column');
    this.copyright = this.root.locator('.footer__copy');
    this.location = this.root.locator('.footer__location');
    this.divider = this.root.locator('lib-divider');
  }

  async getColumnByTitle(title: string): Promise<Locator> {
    return this.linkColumns.filter({ hasText: title });
  }

  async getColumnLinks(title: string): Promise<string[]> {
    const column = this.linkColumns.filter({ has: this.page.locator(`h4:has-text("${title}")`) });
    return column.locator('a.footer-links__link').allTextContents();
  }

  async getSocialLinkHref(platform: string): Promise<string | null> {
    const link = this.socialLinks.filter({ has: this.page.locator(`[aria-label="${platform}"]`) });
    return link.getAttribute('href');
  }

  async getCopyrightText(): Promise<string | null> {
    return this.copyright.textContent();
  }

  async getLocationText(): Promise<string | null> {
    return this.location.textContent();
  }
}
