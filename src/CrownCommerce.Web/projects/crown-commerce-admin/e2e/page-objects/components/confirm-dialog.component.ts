import { Locator, Page } from '@playwright/test';

export class ConfirmDialogComponent {
  readonly root: Locator;
  readonly title: Locator;
  readonly message: Locator;
  readonly cancelButton: Locator;
  readonly confirmButton: Locator;

  constructor(private page: Page) {
    this.root = page.locator('mat-dialog-container');
    this.title = this.root.locator('[mat-dialog-title]');
    this.message = this.root.locator('mat-dialog-content p');
    this.cancelButton = this.root.locator('mat-dialog-actions button[mat-stroked-button]');
    this.confirmButton = this.root.locator('mat-dialog-actions button[mat-flat-button]');
  }

  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
