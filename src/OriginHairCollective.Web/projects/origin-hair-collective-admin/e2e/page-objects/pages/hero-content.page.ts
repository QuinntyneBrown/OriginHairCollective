import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class HeroContentPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly backButton: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly formCard: Locator;
  readonly formCardTitle: Locator;

  readonly heroTitleField: Locator;
  readonly heroSubtitleField: Locator;
  readonly ctaButtonTextField: Locator;
  readonly ctaButtonLinkField: Locator;

  readonly imageSection: Locator;
  readonly imageUploadArea: Locator;
  readonly uploadIcon: Locator;
  readonly uploadText: Locator;
  readonly uploadHint: Locator;

  readonly resetButton: Locator;
  readonly saveButton: Locator;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);

    this.backButton = page.locator('.form-header-left button[mat-icon-button]');
    this.pageTitle = page.locator('.page-header .page-title');
    this.pageSubtitle = page.locator('.page-header .page-subtitle');
    this.formCard = page.locator('.form-card');
    this.formCardTitle = this.formCard.locator('.form-card-title');

    this.heroTitleField = page.locator('mat-form-field').filter({ hasText: 'Hero Title' }).locator('input');
    this.heroSubtitleField = page.locator('mat-form-field').filter({ hasText: 'Hero Subtitle' }).locator('input');
    this.ctaButtonTextField = page.locator('mat-form-field').filter({ hasText: 'CTA Button Text' }).locator('input');
    this.ctaButtonLinkField = page.locator('mat-form-field').filter({ hasText: 'CTA Button Link' }).locator('input');

    this.imageSection = page.locator('.image-section');
    this.imageUploadArea = page.locator('.image-upload-area');
    this.uploadIcon = page.locator('.upload-icon');
    this.uploadText = page.locator('.upload-text');
    this.uploadHint = page.locator('.upload-hint');

    this.resetButton = page.locator('.form-actions button[mat-stroked-button]');
    this.saveButton = page.locator('.form-actions .primary-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/hero-content');
    await this.page.waitForLoadState('domcontentloaded');
    await this.formCard.waitFor({ state: 'visible' });
  }
}
