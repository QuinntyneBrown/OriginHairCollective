import { type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly timeZoneCards: Locator;
  readonly meetingCards: Locator;
  readonly activityItems: Locator;
  readonly sectionTitles: Locator;
  readonly searchButton: Locator;
  readonly searchOverlay: Locator;
  readonly searchInput: Locator;
  readonly loadMoreButton: Locator;
  readonly emptyState: Locator;

  constructor(private page: Page) {
    this.pageTitle = page.locator('.page-title');
    this.pageSubtitle = page.locator('.page-subtitle');
    this.timeZoneCards = page.locator('.timezone-card');
    this.meetingCards = page.locator('.meeting-card');
    this.activityItems = page.locator('.activity-item');
    this.sectionTitles = page.locator('.section-title');
    this.searchButton = page.locator('.header-actions button', { hasText: 'search' });
    this.searchOverlay = page.locator('.search-overlay');
    this.searchInput = page.locator('.search-input-global');
    this.loadMoreButton = page.locator('.load-more-btn');
    this.emptyState = page.locator('.empty-state');
  }

  async goto(): Promise<void> {
    await this.page.goto('/home');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for async meeting data to load
    await this.page.waitForTimeout(500);
  }

  async getMeetingTitle(index: number): Promise<string> {
    return (await this.meetingCards.nth(index).locator('.meeting-title').textContent()) ?? '';
  }

  async getMeetingTime(index: number): Promise<string> {
    return (await this.meetingCards.nth(index).locator('.meeting-time').textContent()) ?? '';
  }

  async getActivityTitle(index: number): Promise<string> {
    return (await this.activityItems.nth(index).locator('.activity-title').textContent()) ?? '';
  }

  async getActivityDescription(index: number): Promise<string> {
    return (await this.activityItems.nth(index).locator('.activity-desc').textContent()) ?? '';
  }
}
