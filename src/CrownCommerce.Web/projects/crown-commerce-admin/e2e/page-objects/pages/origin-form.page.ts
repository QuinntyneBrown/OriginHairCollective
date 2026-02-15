import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class OriginFormPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly backButton: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly formCard: Locator;
  readonly formCardTitle: Locator;

  readonly countryField: Locator;
  readonly regionField: Locator;
  readonly descriptionField: Locator;

  readonly cancelButton: Locator;
  readonly saveButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.backButton = page.locator('.form-header-left button[mat-icon-button]');
    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.formCard = page.locator('.form-card');
    this.formCardTitle = this.formCard.locator('.form-card-title');

    this.countryField = page.locator('mat-form-field').filter({ hasText: 'Country' }).locator('input');
    this.regionField = page.locator('mat-form-field').filter({ hasText: 'Region' }).locator('input');
    this.descriptionField = page.locator('mat-form-field').filter({ hasText: 'Description' }).locator('textarea');

    this.cancelButton = page.locator('.form-actions button[mat-stroked-button]');
    this.saveButton = page.locator('.form-actions .primary-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/origins/new');
    await this.page.waitForLoadState('domcontentloaded');
    await this.formCard.waitFor({ state: 'visible' });
  }
}
