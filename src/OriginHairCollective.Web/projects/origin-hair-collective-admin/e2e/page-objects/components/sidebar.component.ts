import { Locator, Page } from '@playwright/test';

export class SidebarComponent {
  readonly root: Locator;
  readonly logoIcon: Locator;
  readonly logoName: Locator;
  readonly logoSub: Locator;
  readonly navSection: Locator;
  readonly navItems: Locator;
  readonly userAvatar: Locator;
  readonly userName: Locator;
  readonly userRole: Locator;
  readonly settingsButton: Locator;

  constructor(private page: Page) {
    this.root = page.locator('aside.sidebar');
    this.logoIcon = this.root.locator('.logo-icon');
    this.logoName = this.root.locator('.logo-name');
    this.logoSub = this.root.locator('.logo-sub');
    this.navSection = this.root.locator('.nav-section');
    this.navItems = this.root.locator('.nav-item');
    this.userAvatar = this.root.locator('.user-avatar');
    this.userName = this.root.locator('.user-name');
    this.userRole = this.root.locator('.user-role');
    this.settingsButton = this.root.locator('.settings-btn');
  }

  async getNavItemByLabel(label: string): Promise<Locator> {
    return this.navItems.filter({ hasText: label });
  }

  async getNavItemLabels(): Promise<string[]> {
    return this.root.locator('.nav-label').allTextContents();
  }

  async getActiveNavItem(): Promise<Locator> {
    return this.root.locator('.nav-item--active');
  }

  async clickNavItem(label: string): Promise<void> {
    const item = await this.getNavItemByLabel(label);
    await item.click();
  }

  async getNavItemCount(): Promise<number> {
    return this.navItems.count();
  }
}
