import { Locator, Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class ProductFormPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  readonly backButton: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;
  readonly formCard: Locator;
  readonly formCardTitle: Locator;

  readonly productNameField: Locator;
  readonly originSelect: Locator;
  readonly textureSelect: Locator;
  readonly typeSelect: Locator;
  readonly lengthField: Locator;
  readonly priceField: Locator;
  readonly imageUrlField: Locator;
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

    this.productNameField = page.locator('mat-form-field').filter({ hasText: 'Product Name' }).locator('input');
    this.originSelect = page.locator('mat-form-field').filter({ hasText: 'Origin' }).locator('mat-select');
    this.textureSelect = page.locator('mat-form-field').filter({ hasText: 'Texture' }).locator('mat-select');
    this.typeSelect = page.locator('mat-form-field').filter({ hasText: 'Type' }).locator('mat-select');
    this.lengthField = page.locator('mat-form-field').filter({ hasText: 'Length' }).locator('input');
    this.priceField = page.locator('mat-form-field').filter({ hasText: 'Price' }).locator('input');
    this.imageUrlField = page.locator('mat-form-field').filter({ hasText: 'Image URL' }).locator('input');
    this.descriptionField = page.locator('mat-form-field').filter({ hasText: 'Description' }).locator('textarea');

    this.cancelButton = page.locator('.form-actions button[mat-stroked-button]');
    this.saveButton = page.locator('.form-actions .primary-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products/new');
    await this.page.waitForLoadState('domcontentloaded');
    await this.formCard.waitFor({ state: 'visible' });
  }

  async openSelect(selectLocator: Locator): Promise<void> {
    await selectLocator.click();
  }

  async getSelectOptions(): Promise<string[]> {
    const options = this.page.locator('mat-option');
    await options.first().waitFor({ state: 'visible' });
    return options.allTextContents().then((texts) => texts.map((t) => t.trim()));
  }

  async selectOption(optionText: string): Promise<void> {
    await this.page.locator('mat-option').filter({ hasText: optionText }).click();
  }
}
