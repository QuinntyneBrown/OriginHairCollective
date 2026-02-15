import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class MeetingFormPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  readonly formCards: Locator;
  readonly meetingDetailsCard: Locator;
  readonly attendeesCard: Locator;
  readonly optionsCard: Locator;

  readonly titleField: Locator;
  readonly descriptionField: Locator;
  readonly dateField: Locator;
  readonly startTimeField: Locator;
  readonly endTimeField: Locator;
  readonly locationField: Locator;
  readonly organizerSelect: Locator;
  readonly attendeesSelect: Locator;

  readonly attendeesPreview: Locator;
  readonly attendeeChips: Locator;
  readonly exportCalendarCheckbox: Locator;

  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  readonly errorBanner: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');

    this.formCards = page.locator('.form-card');
    this.meetingDetailsCard = this.formCards.filter({ hasText: 'Meeting Details' });
    this.attendeesCard = this.formCards.filter({ hasText: 'Organizer & Attendees' });
    this.optionsCard = this.formCards.filter({ hasText: 'Options' });

    this.titleField = page.locator('mat-form-field').filter({ hasText: 'Meeting Title' }).locator('input');
    this.descriptionField = page.locator('mat-form-field').filter({ hasText: 'Description' }).locator('textarea');
    this.dateField = page.locator('mat-form-field').filter({ hasText: 'Date' }).locator('input');
    this.startTimeField = page.locator('mat-form-field').filter({ hasText: 'Start Time' }).locator('input');
    this.endTimeField = page.locator('mat-form-field').filter({ hasText: 'End Time' }).locator('input');
    this.locationField = page.locator('mat-form-field').filter({ hasText: 'Location' }).locator('input');
    this.organizerSelect = page.locator('mat-form-field').filter({ hasText: 'Organizer' }).locator('mat-select');
    this.attendeesSelect = page.locator('mat-form-field').filter({ hasText: 'Attendees' }).locator('mat-select');

    this.attendeesPreview = page.locator('.attendees-preview');
    this.attendeeChips = page.locator('.attendee-chip');
    this.exportCalendarCheckbox = page.locator('mat-checkbox');

    this.cancelButton = page.locator('.cancel-btn');
    this.submitButton = page.locator('.form-actions .primary-btn');

    this.errorBanner = page.locator('.error-banner');
  }

  async goto(): Promise<void> {
    await this.page.goto('/meetings/new');
    await this.page.waitForLoadState('domcontentloaded');
    await this.pageTitle.waitFor({ state: 'visible' });
  }
}
