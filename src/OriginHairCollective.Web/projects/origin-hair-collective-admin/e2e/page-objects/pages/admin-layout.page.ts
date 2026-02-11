import { Page } from '@playwright/test';
import { SidebarComponent } from '../components/sidebar.component';
import { ToolbarComponent } from '../components/toolbar.component';

export class AdminLayoutPage {
  readonly sidebar: SidebarComponent;
  readonly toolbar: ToolbarComponent;

  constructor(private page: Page) {
    this.sidebar = new SidebarComponent(page);
    this.toolbar = new ToolbarComponent(page);
  }

  async goto(path: string = '/dashboard'): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
    await this.sidebar.root.waitFor({ state: 'visible' });
  }
}
