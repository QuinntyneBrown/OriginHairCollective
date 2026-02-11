import { type Locator, type Page } from '@playwright/test';

export class CommunitySection {
  readonly root: Locator;
  readonly sectionHeader: Locator;
  readonly label: Locator;
  readonly heading: Locator;
  readonly handle: Locator;
  readonly photosGrid: Locator;
  readonly photos: Locator;

  constructor(private page: Page) {
    this.root = page.locator('section.community');
    this.sectionHeader = this.root.locator('lib-section-header');
    this.label = this.sectionHeader.locator('.section-header__label');
    this.heading = this.sectionHeader.locator('.section-header__heading');
    this.handle = this.root.locator('.community__handle');
    this.photosGrid = this.root.locator('.community__photos');
    this.photos = this.photosGrid.locator('.community__photo');
  }

  async getLabelText(): Promise<string | null> {
    return this.label.textContent();
  }

  async getHeadingText(): Promise<string | null> {
    return this.heading.textContent();
  }

  async getHandleText(): Promise<string | null> {
    return this.handle.textContent();
  }

  async getPhotoCount(): Promise<number> {
    return this.photos.count();
  }

  async photoHasBackgroundImage(index: number): Promise<boolean> {
    const style = await this.photos.nth(index).getAttribute('style');
    return style !== null && style.includes('background-image');
  }
}
