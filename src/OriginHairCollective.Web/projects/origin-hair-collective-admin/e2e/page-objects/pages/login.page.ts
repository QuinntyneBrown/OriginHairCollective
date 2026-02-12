import { Locator, Page, expect } from '@playwright/test';

export class LoginPage {
  readonly root: Locator;
  readonly logoIcon: Locator;
  readonly logoName: Locator;
  readonly logoSub: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly togglePasswordButton: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly spinner: Locator;

  constructor(private page: Page) {
    this.root = page.locator('.login-shell');
    this.logoIcon = page.locator('.login-logo .logo-icon');
    this.logoName = page.locator('.login-logo .logo-name');
    this.logoSub = page.locator('.login-logo .logo-sub');
    this.title = page.locator('.login-title');
    this.subtitle = page.locator('.login-subtitle');
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.togglePasswordButton = page.locator('[data-testid="toggle-password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('.login-error');
    this.spinner = page.locator('mat-spinner');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    await this.loginButton.waitFor({ state: 'visible' });
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.title).toHaveText('Sign in');
  }

  async expectErrorVisible(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectErrorHidden(): Promise<void> {
    await expect(this.errorMessage).not.toBeVisible();
  }
}
