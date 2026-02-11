import { Locator, Page } from '@playwright/test';

export class DataTableComponent {
  readonly root: Locator;
  readonly table: Locator;
  readonly headerRow: Locator;
  readonly headerCells: Locator;
  readonly rows: Locator;

  constructor(private page: Page, parentLocator?: Locator) {
    const parent = parentLocator ?? page;
    this.root = parent.locator('.table-card');
    this.table = this.root.locator('table');
    this.headerRow = this.table.locator('thead tr');
    this.headerCells = this.table.locator('th');
    this.rows = this.table.locator('tbody tr');
  }

  async waitForRows(): Promise<void> {
    await this.rows.first().waitFor({ state: 'visible' });
  }

  async getRowCount(): Promise<number> {
    await this.waitForRows();
    return this.rows.count();
  }

  async getHeaderTexts(): Promise<string[]> {
    await this.headerCells.first().waitFor({ state: 'visible' });
    return this.headerCells.allTextContents();
  }

  async getCellText(rowIndex: number, colIndex: number): Promise<string> {
    await this.waitForRows();
    const row = this.rows.nth(rowIndex);
    const cells = row.locator('td');
    return (await cells.nth(colIndex).textContent())?.trim() ?? '';
  }

  async getRowTexts(rowIndex: number): Promise<string[]> {
    await this.waitForRows();
    const row = this.rows.nth(rowIndex);
    const cells = row.locator('td');
    const count = await cells.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      texts.push((await cells.nth(i).textContent())?.trim() ?? '');
    }
    return texts;
  }

  getActionsCell(rowIndex: number): Locator {
    return this.rows.nth(rowIndex).locator('.actions-cell');
  }

  getEditButton(rowIndex: number): Locator {
    return this.getActionsCell(rowIndex).locator('.action-btn').first();
  }

  getDeleteButton(rowIndex: number): Locator {
    return this.getActionsCell(rowIndex).locator('.action-btn--delete');
  }
}
