import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class ScheduleCalendarPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly bookMeetingButton: Locator;

  readonly calendarGrid: Locator;
  readonly calendarHeaderCells: Locator;
  readonly calendarCells: Locator;
  readonly monthLabel: Locator;
  readonly prevMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly todayButton: Locator;
  readonly employeeFilter: Locator;

  readonly sidebarTitle: Locator;
  readonly upcomingEvents: Locator;
  readonly sidebarEmpty: Locator;

  readonly eventDetail: Locator;
  readonly eventDetailTitle: Locator;
  readonly editMeetingButton: Locator;
  readonly cancelMeetingButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.bookMeetingButton = page.locator('.header-actions .primary-btn');

    this.calendarGrid = page.locator('.calendar-grid');
    this.calendarHeaderCells = page.locator('.calendar-header-cell');
    this.calendarCells = page.locator('.calendar-cell');
    this.monthLabel = page.locator('.month-label');
    this.prevMonthButton = page.locator('.calendar-nav button[mat-icon-button]').first();
    this.nextMonthButton = page.locator('.calendar-nav button[mat-icon-button]').nth(1);
    this.todayButton = page.locator('.today-btn');
    this.employeeFilter = page.locator('.employee-filter mat-select');

    this.sidebarTitle = page.locator('.sidebar-title');
    this.upcomingEvents = page.locator('.upcoming-event');
    this.sidebarEmpty = page.locator('.sidebar-empty');

    this.eventDetail = page.locator('.event-detail');
    this.eventDetailTitle = page.locator('.detail-title');
    this.editMeetingButton = page.locator('.detail-actions button').filter({ hasText: 'Edit' });
    this.cancelMeetingButton = page.locator('.detail-actions button').filter({ hasText: 'Cancel Meeting' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/schedule');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  getCalendarEvent(index: number): Locator {
    return this.page.locator('.calendar-event').nth(index);
  }
}
