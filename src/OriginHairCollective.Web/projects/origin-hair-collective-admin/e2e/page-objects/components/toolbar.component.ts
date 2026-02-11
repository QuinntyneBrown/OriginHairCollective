import { Locator, Page } from '@playwright/test';

export class ToolbarComponent {
  readonly root: Locator;
  readonly title: Locator;
  readonly actions: Locator;
  readonly searchButton: Locator;
  readonly notificationsButton: Locator;

  constructor(private page: Page) {
    this.root = page.locator('.toolbar');
    this.title = this.root.locator('.toolbar-title');
    this.actions = this.root.locator('.toolbar-actions');
    this.searchButton = this.actions.locator('button', { has: page.locator('mat-icon:text("search")') });
    this.notificationsButton = this.actions.locator('button', { has: page.locator('mat-icon:text("notifications")') });
  }

  async getTitle(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }
}
