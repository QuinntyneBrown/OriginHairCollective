import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';
import { DataTableComponent } from '../components/data-table.component';
import { PaginationComponent } from '../components/pagination.component';

export class OriginsListPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;
  readonly dataTable: DataTableComponent;
  readonly pagination: PaginationComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly addOriginButton: Locator;
  readonly searchField: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);
    this.dataTable = new DataTableComponent(page);
    this.pagination = new PaginationComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.addOriginButton = page.locator('.page-header .primary-btn');
    this.searchField = page.locator('.search-field input');
  }

  async goto(): Promise<void> {
    await this.page.goto('/origins');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }
}
