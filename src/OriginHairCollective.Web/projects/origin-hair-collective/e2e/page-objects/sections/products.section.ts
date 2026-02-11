import { type Locator, type Page } from '@playwright/test';

export interface ProductCardInfo {
  tag: string | null;
  title: string | null;
  description: string | null;
  price: string | null;
}

export class ProductsSection {
  readonly root: Locator;
  readonly sectionHeader: Locator;
  readonly label: Locator;
  readonly heading: Locator;
  readonly grid: Locator;
  readonly productCards: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.products');
    this.sectionHeader = this.root.locator('lib-section-header');
    this.label = this.sectionHeader.locator('.section-header__label');
    this.heading = this.sectionHeader.locator('.section-header__heading');
    this.grid = this.root.locator('.products__grid');
    this.productCards = this.grid.locator('lib-product-card');
  }

  async getProductCardCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProductCardInfo(index: number): Promise<ProductCardInfo> {
    const card = this.productCards.nth(index);
    return {
      tag: await card.locator('.product-card__tag').textContent(),
      title: await card.locator('.product-card__title').textContent(),
      description: await card.locator('.product-card__description').textContent(),
      price: await card.locator('.product-card__price').textContent(),
    };
  }

  async hasProductImage(index: number): Promise<boolean> {
    return this.productCards.nth(index).locator('.product-card__image img').isVisible();
  }

  async getProductImageSrc(index: number): Promise<string | null> {
    return this.productCards.nth(index).locator('.product-card__image img').getAttribute('src');
  }

  async getProductImageAlt(index: number): Promise<string | null> {
    return this.productCards.nth(index).locator('.product-card__image img').getAttribute('alt');
  }

  async getLabelText(): Promise<string | null> {
    return this.label.textContent();
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }
}
