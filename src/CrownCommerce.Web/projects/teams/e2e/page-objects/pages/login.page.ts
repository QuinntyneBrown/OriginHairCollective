import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly root: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly formTitle: Locator;
  readonly formSubtitle: Locator;
  readonly errorBanner: Locator;
  readonly rememberMeToggle: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly heroTitle: Locator;

  constructor(private page: Page) {
    this.root = page.locator('.login-page');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.signInButton = page.locator('button[type="submit"]');
    this.formTitle = page.locator('.form-title');
    this.formSubtitle = page.locator('.form-subtitle');
    this.errorBanner = page.locator('.error-banner');
    this.rememberMeToggle = page.locator('.remember-toggle');
    this.forgotPasswordLink = page.locator('.forgot-link');
    this.signUpLink = page.locator('.signup-link');
    this.heroTitle = page.locator('.hero-title');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    await this.root.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
