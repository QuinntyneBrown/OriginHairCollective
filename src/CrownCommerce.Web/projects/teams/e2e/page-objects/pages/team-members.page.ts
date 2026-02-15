import { type Locator, type Page } from '@playwright/test';

export class TeamMembersPage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly inviteButton: Locator;
  readonly searchInput: Locator;
  readonly statusToggle: Locator;
  readonly memberCards: Locator;
  readonly emptyState: Locator;
  readonly loadMoreButton: Locator;

  constructor(private page: Page) {
    this.pageTitle = page.locator('.page-title');
    this.pageSubtitle = page.locator('.page-subtitle');
    this.inviteButton = page.locator('.invite-btn');
    this.searchInput = page.locator('.search-bar .search-input');
    this.statusToggle = page.locator('mat-button-toggle-group');
    this.memberCards = page.locator('.member-card');
    this.emptyState = page.locator('.empty-state');
    this.loadMoreButton = page.locator('.load-more-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/team');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  async getMemberName(index: number): Promise<string> {
    return (await this.memberCards.nth(index).locator('.member-name').textContent()) ?? '';
  }

  async getMemberRole(index: number): Promise<string> {
    return (await this.memberCards.nth(index).locator('.member-role').textContent()) ?? '';
  }

  async getMemberDepartment(index: number): Promise<string> {
    return (await this.memberCards.nth(index).locator('.member-dept').textContent()) ?? '';
  }

  async getMemberInitials(index: number): Promise<string> {
    return (await this.memberCards.nth(index).locator('.member-avatar').textContent()) ?? '';
  }

  async filterByStatus(status: 'all' | 'online' | 'away'): Promise<void> {
    await this.statusToggle.locator(`mat-button-toggle[value="${status}"]`).click();
  }

  async searchMembers(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clickChatAction(index: number): Promise<void> {
    await this.memberCards.nth(index).locator('.action-btn', { hasText: 'chat' }).click();
  }

  async clickVideoAction(index: number): Promise<void> {
    await this.memberCards.nth(index).locator('.action-btn', { hasText: 'videocam' }).click();
  }
}
