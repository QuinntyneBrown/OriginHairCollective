import { test, expect } from '@playwright/test';
import { SubscribersListPage } from '../page-objects/pages/subscribers-list.page';
import { ConfirmDialogComponent } from '../page-objects/components/confirm-dialog.component';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockSubscribers, mockSubscriberStats } from '../fixtures/mock-data';

test.describe('Subscribers List', () => {
  let subscribersPage: SubscribersListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    subscribersPage = new SubscribersListPage(page);
    await subscribersPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Email Subscribers"', async () => {
      await expect(subscribersPage.pageTitle).toHaveText('Email Subscribers');
    });

    test('should display page subtitle', async () => {
      await expect(subscribersPage.pageSubtitle).toHaveText('Coming soon page signups across brands');
    });

    test('should display Export button', async () => {
      await expect(subscribersPage.exportButton).toBeVisible();
      await expect(subscribersPage.exportButton).toContainText('Export');
    });
  });

  test.describe('Stats Cards', () => {
    test('should display stat cards', async () => {
      const count = await subscribersPage.statCards.count();
      expect(count).toBe(4);
    });

    test('should display Active stat', async () => {
      const card = subscribersPage.statCards.filter({ hasText: 'Active' });
      await expect(card).toBeVisible();
      await expect(card.locator('.stat-value')).toHaveText(String(mockSubscriberStats.totalActive));
    });
  });

  test.describe('Brand Filter', () => {
    test('should display brand toggle group', async () => {
      await expect(subscribersPage.brandToggleGroup).toBeVisible();
    });

    test('should display All Brands toggle', async () => {
      await expect(subscribersPage.getBrandToggle('All Brands')).toBeVisible();
    });

    test('should display Origin Hair toggle', async () => {
      await expect(subscribersPage.getBrandToggle('Origin Hair')).toBeVisible();
    });

    test('should display Mane Haus toggle', async () => {
      await expect(subscribersPage.getBrandToggle('Mane Haus')).toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('should display search field', async () => {
      await expect(subscribersPage.searchField).toBeVisible();
    });

    test('should have search placeholder text', async () => {
      await expect(subscribersPage.searchField).toHaveAttribute('placeholder', 'Search subscribers...');
    });

    test('should filter subscribers by search term', async () => {
      await subscribersPage.searchField.fill('alice');
      await expect(subscribersPage.dataTable.rows.first()).toContainText('alice@example.com');
    });
  });

  test.describe('Table Data', () => {
    test('should display subscribers table', async () => {
      await expect(subscribersPage.dataTable.table).toBeVisible();
    });

    test('should display correct header columns', async () => {
      const headers = await subscribersPage.dataTable.getHeaderTexts();
      const trimmed = headers.map((h) => h.trim());
      expect(trimmed).toContain('Email');
      expect(trimmed).toContain('Status');
      expect(trimmed).toContain('Brand');
      expect(trimmed).toContain('Signed Up');
      expect(trimmed).toContain('Actions');
    });

    test('should display subscriber rows', async () => {
      const count = await subscribersPage.dataTable.getRowCount();
      expect(count).toBe(mockSubscribers.length);
    });

    test('should display first subscriber email', async () => {
      const email = await subscribersPage.dataTable.getCellText(0, 0);
      expect(email).toBe(mockSubscribers[0].email);
    });

    test('should display status chips', async () => {
      const chip = subscribersPage.getStatusChip(0);
      await expect(chip.first()).toBeVisible();
    });

    test('should display delete button for each row', async () => {
      const deleteBtn = subscribersPage.getDeleteButton(0);
      await expect(deleteBtn).toBeVisible();
    });
  });

  test.describe('Pagination', () => {
    test('should display paginator text', async () => {
      const text = await subscribersPage.pagination.getPaginatorText();
      expect(text).toContain('Showing');
      expect(text).toContain('53');
    });

    test('should have Previous button disabled on first page', async () => {
      const disabled = await subscribersPage.pagination.isPreviousDisabled();
      expect(disabled).toBe(true);
    });
  });

  test.describe('Delete', () => {
    test('should open confirmation dialog when clicking delete', async ({ page }) => {
      const deleteBtn = subscribersPage.getDeleteButton(0);
      await deleteBtn.click();
      const dialog = new ConfirmDialogComponent(page);
      await dialog.waitForOpen();
      await expect(dialog.title).toHaveText('Delete Subscriber');
      await expect(dialog.message).toContainText('Are you sure');
    });

    test('should close dialog when cancelling delete', async ({ page }) => {
      const deleteBtn = subscribersPage.getDeleteButton(0);
      await deleteBtn.click();
      const dialog = new ConfirmDialogComponent(page);
      await dialog.waitForOpen();
      await dialog.cancel();
      await expect(dialog.root).not.toBeVisible();
    });
  });
});
