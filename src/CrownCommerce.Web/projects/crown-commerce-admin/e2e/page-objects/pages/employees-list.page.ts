import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';
import { DataTableComponent } from '../components/data-table.component';

export class EmployeesListPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;
  readonly dataTable: DataTableComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly statusToggleGroup: Locator;
  readonly statCards: Locator;
  readonly emptyState: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);
    this.dataTable = new DataTableComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.statusToggleGroup = page.locator('.status-toggle');
    this.statCards = page.locator('.stat-card');
    this.emptyState = page.locator('.empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/employees');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  getStatusToggle(label: string): Locator {
    return this.statusToggleGroup.locator('mat-button-toggle').filter({ hasText: label });
  }

  getViewButton(rowIndex: number): Locator {
    return this.dataTable.rows.nth(rowIndex).locator('.actions-cell .action-btn').first();
  }

  getEditButton(rowIndex: number): Locator {
    return this.dataTable.rows.nth(rowIndex).locator('.actions-cell .action-btn').nth(1);
  }

  getStatusChip(rowIndex: number): Locator {
    return this.dataTable.rows.nth(rowIndex).locator('.chip');
  }
}
