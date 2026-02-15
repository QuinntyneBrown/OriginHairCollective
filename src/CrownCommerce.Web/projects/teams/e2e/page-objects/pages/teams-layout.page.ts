import { type Locator, type Page } from '@playwright/test';

export class TeamsLayoutPage {
  readonly sidebar: Locator;
  readonly navItems: Locator;
  readonly userAvatar: Locator;
  readonly userName: Locator;
  readonly userRole: Locator;
  readonly logoutButton: Locator;
  readonly logoText: Locator;

  constructor(private page: Page) {
    this.sidebar = page.locator('.sidebar');
    this.navItems = page.locator('.nav-item');
    this.userAvatar = page.locator('.sidebar .user-avatar');
    this.userName = page.locator('.user-name');
    this.userRole = page.locator('.user-role');
    this.logoutButton = page.locator('.settings-btn');
    this.logoText = page.locator('.logo-name');
  }

  async goto(path: string = '/home'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Navigate and wait for sidebar to be fully rendered with user data */
  async gotoAndWaitForLayout(path: string = '/home'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
    await this.sidebar.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for user data to load
    await this.userName.waitFor({ state: 'visible', timeout: 10000 });
  }

  async clickNavItem(label: string): Promise<void> {
    await this.page.locator('.nav-item', { hasText: label }).click();
  }

  async getActiveNavLabel(): Promise<string> {
    return (await this.page.locator('.nav-item--active .nav-label').textContent()) ?? '';
  }
}
