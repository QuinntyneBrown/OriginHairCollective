import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';
import { DataTableComponent } from '../components/data-table.component';
import { PaginationComponent } from '../components/pagination.component';

export class ProductsListPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;
  readonly dataTable: DataTableComponent;
  readonly pagination: PaginationComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly addProductButton: Locator;
  readonly searchField: Locator;
  readonly filterButtons: Locator;
  readonly typeFilterButton: Locator;
  readonly originFilterButton: Locator;
  readonly textureFilterButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);
    this.dataTable = new DataTableComponent(page);
    this.pagination = new PaginationComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.addProductButton = page.locator('.page-header .primary-btn, .page-header a[routerlink="/products/new"]');
    this.searchField = page.locator('.search-field input');
    this.filterButtons = page.locator('.filter-row .filter-btn');
    this.typeFilterButton = this.filterButtons.filter({ hasText: 'Type' });
    this.originFilterButton = this.filterButtons.filter({ hasText: 'Origin' });
    this.textureFilterButton = this.filterButtons.filter({ hasText: 'Texture' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }
}
