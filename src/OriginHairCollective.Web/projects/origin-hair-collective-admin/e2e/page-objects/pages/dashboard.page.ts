import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';
import type { MetricCardInfo, RecentProductInfo, RecentInquiryInfo } from '../../fixtures/mock-data';

export class DashboardPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly welcomeText: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly metricsRow: Locator;
  readonly metricCards: Locator;

  readonly recentProductsCard: Locator;
  readonly recentProductsTitle: Locator;
  readonly recentProductsViewAll: Locator;
  readonly productsTable: Locator;
  readonly productsTableRows: Locator;

  readonly recentInquiriesCard: Locator;
  readonly recentInquiriesTitle: Locator;
  readonly recentInquiriesViewAll: Locator;
  readonly inquiryItems: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.welcomeText = page.locator('.welcome-text');
    this.pageTitle = page.locator('.welcome-row .page-title');
    this.pageSubtitle = page.locator('.welcome-row .page-subtitle');
    this.metricsRow = page.locator('.metrics-row');
    this.metricCards = page.locator('.metric-card');

    this.recentProductsCard = page.locator('.recent-products-card');
    this.recentProductsTitle = this.recentProductsCard.locator('.card-title');
    this.recentProductsViewAll = this.recentProductsCard.locator('.view-all-link');
    this.productsTable = this.recentProductsCard.locator('table');
    this.productsTableRows = this.productsTable.locator('tbody tr');

    this.recentInquiriesCard = page.locator('.recent-inquiries-card');
    this.recentInquiriesTitle = this.recentInquiriesCard.locator('.card-title');
    this.recentInquiriesViewAll = this.recentInquiriesCard.locator('.view-all-link');
    this.inquiryItems = page.locator('.inquiry-item');
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('domcontentloaded');
    await this.metricCards.first().waitFor({ state: 'visible' });
  }

  async getMetricCardInfo(index: number): Promise<MetricCardInfo> {
    const card = this.metricCards.nth(index);
    return {
      label: (await card.locator('.metric-label').textContent())?.trim() ?? '',
      value: (await card.locator('.metric-value').textContent())?.trim() ?? '',
      change: (await card.locator('.metric-change').textContent())?.trim() ?? '',
    };
  }

  async getMetricCardCount(): Promise<number> {
    return this.metricCards.count();
  }

  async getRecentProductInfo(index: number): Promise<RecentProductInfo> {
    const row = this.productsTableRows.nth(index);
    const cells = row.locator('td');
    return {
      name: (await cells.nth(0).textContent())?.trim() ?? '',
      type: (await cells.nth(1).textContent())?.trim() ?? '',
      price: (await cells.nth(2).textContent())?.trim() ?? '',
      origin: (await cells.nth(3).textContent())?.trim() ?? '',
    };
  }

  async getRecentProductCount(): Promise<number> {
    return this.productsTableRows.count();
  }

  async getInquiryItemInfo(index: number): Promise<RecentInquiryInfo> {
    const item = this.inquiryItems.nth(index);
    return {
      initials: (await item.locator('.inquiry-avatar').textContent())?.trim() ?? '',
      name: (await item.locator('.inquiry-name').textContent())?.trim() ?? '',
      message: (await item.locator('.inquiry-message').textContent())?.trim() ?? '',
      time: (await item.locator('.inquiry-time').textContent())?.trim() ?? '',
    };
  }

  async getInquiryItemCount(): Promise<number> {
    return this.inquiryItems.count();
  }
}
