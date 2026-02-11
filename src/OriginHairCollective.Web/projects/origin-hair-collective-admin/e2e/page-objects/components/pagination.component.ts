import { Locator, Page } from '@playwright/test';

export class PaginationComponent {
  readonly root: Locator;
  readonly text: Locator;
  readonly buttons: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  constructor(private page: Page, parentLocator?: Locator) {
    const parent = parentLocator ?? page;
    this.root = parent.locator('.paginator-row');
    this.text = this.root.locator('.paginator-text');
    this.buttons = this.root.locator('.paginator-buttons');
    this.previousButton = this.buttons.locator('button', { hasText: 'Previous' });
    this.nextButton = this.buttons.locator('button, a').filter({ hasText: 'Next' });
  }

  async getPaginatorText(): Promise<string> {
    return (await this.text.textContent())?.trim() ?? '';
  }

  async isPreviousDisabled(): Promise<boolean> {
    return this.previousButton.isDisabled();
  }
}
