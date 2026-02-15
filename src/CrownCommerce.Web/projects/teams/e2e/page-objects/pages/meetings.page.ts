import { type Locator, type Page } from '@playwright/test';

export class MeetingsPage {
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly newMeetingButton: Locator;
  readonly weekDays: Locator;
  readonly scheduleCards: Locator;
  readonly sectionTitle: Locator;
  readonly emptyState: Locator;
  readonly loadMoreButton: Locator;

  constructor(private page: Page) {
    this.pageTitle = page.locator('.page-title');
    this.pageSubtitle = page.locator('.page-subtitle');
    this.newMeetingButton = page.locator('.new-meeting-btn');
    this.weekDays = page.locator('.day-cell');
    this.scheduleCards = page.locator('.schedule-card');
    this.sectionTitle = page.locator('.section-title');
    this.emptyState = page.locator('.empty-state');
    this.loadMoreButton = page.locator('.load-more-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/meetings');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  async getMeetingTitle(index: number): Promise<string> {
    return (await this.scheduleCards.nth(index).locator('.schedule-title').textContent()) ?? '';
  }

  async getMeetingStartTime(index: number): Promise<string> {
    return (await this.scheduleCards.nth(index).locator('.schedule-start').textContent()) ?? '';
  }

  async selectDay(index: number): Promise<void> {
    await this.weekDays.nth(index).click();
  }

  async getSelectedDay(): Promise<string> {
    return (await this.page.locator('.day-cell--selected .day-number').textContent()) ?? '';
  }

  async getTodayDay(): Promise<Locator> {
    return this.page.locator('.day-cell--today');
  }

  async acceptMeeting(index: number): Promise<void> {
    await this.scheduleCards.nth(index).locator('.rsvp-btn--accept').click();
  }

  async declineMeeting(index: number): Promise<void> {
    await this.scheduleCards.nth(index).locator('.rsvp-btn--decline').click();
  }

  async getRsvpBadge(index: number): Promise<Locator> {
    return this.scheduleCards.nth(index).locator('.rsvp-badge');
  }

  async openMeetingMenu(index: number): Promise<void> {
    await this.scheduleCards.nth(index).locator('.join-btn').click();
  }
}
