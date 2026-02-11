import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';
import { DataTableComponent } from '../components/data-table.component';
import { PaginationComponent } from '../components/pagination.component';

export class InquiriesListPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;
  readonly dataTable: DataTableComponent;
  readonly pagination: PaginationComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly exportButton: Locator;
  readonly searchField: Locator;
  readonly statusFilterButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);
    this.dataTable = new DataTableComponent(page);
    this.pagination = new PaginationComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.exportButton = page.locator('.header-actions .filter-btn').filter({ hasText: 'Export' });
    this.searchField = page.locator('.search-field input');
    this.statusFilterButton = page.locator('.filter-row .filter-btn').filter({ hasText: 'Status' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/inquiries');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  getViewButton(rowIndex: number): Locator {
    return this.dataTable.rows.nth(rowIndex).locator('.actions-cell .action-btn').first();
  }

  getDeleteButton(rowIndex: number): Locator {
    return this.dataTable.rows.nth(rowIndex).locator('.actions-cell .action-btn--delete');
  }
}
