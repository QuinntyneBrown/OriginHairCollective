import { type Locator, type Page } from '@playwright/test';

export interface BenefitCardInfo {
  title: string | null;
  description: string | null;
}

export class BenefitsSection {
  readonly root: Locator;
  readonly sectionHeader: Locator;
  readonly label: Locator;
  readonly heading: Locator;
  readonly grid: Locator;
  readonly benefitCards: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.benefits');
    this.sectionHeader = this.root.locator('lib-section-header');
    this.label = this.sectionHeader.locator('.section-header__label');
    this.heading = this.sectionHeader.locator('.section-header__heading');
    this.grid = this.root.locator('.benefits__grid');
    this.benefitCards = this.grid.locator('lib-benefit-card');
  }

  async getBenefitCardCount(): Promise<number> {
    return this.benefitCards.count();
  }

  async getBenefitCardInfo(index: number): Promise<BenefitCardInfo> {
    const card = this.benefitCards.nth(index);
    return {
      title: await card.locator('.benefit-card__title').textContent(),
      description: await card.locator('.benefit-card__description').textContent(),
    };
  }

  async hasBenefitIcon(index: number): Promise<boolean> {
    return this.benefitCards.nth(index).locator('.benefit-card__icon svg').isVisible();
  }

  async getLabelText(): Promise<string | null> {
    return this.label.textContent();
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }
}
