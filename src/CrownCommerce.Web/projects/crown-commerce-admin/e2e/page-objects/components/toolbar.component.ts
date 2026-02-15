import { Locator, Page } from '@playwright/test';

export class ToolbarComponent {
  readonly root: Locator;
  readonly title: Locator;

  constructor(private page: Page) {
    this.root = page.locator('.toolbar');
    this.title = this.root.locator('.toolbar-title');
  }

  async getTitle(): Promise<string> {
    return (await this.title.textContent()) ?? '';
  }
}
