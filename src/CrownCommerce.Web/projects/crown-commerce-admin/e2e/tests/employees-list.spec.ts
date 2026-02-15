import { test, expect } from '@playwright/test';
import { EmployeesListPage } from '../page-objects/pages/employees-list.page';
import { setupApiMocks } from '../fixtures/api-mocks';
import { mockEmployees } from '../fixtures/mock-data';

test.describe('Employees List', () => {
  let employeesPage: EmployeesListPage;

  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    employeesPage = new EmployeesListPage(page);
    await employeesPage.goto();
  });

  test.describe('Page Header', () => {
    test('should display page title "Team Members"', async () => {
      await expect(employeesPage.pageTitle).toHaveText('Team Members');
    });

    test('should display page subtitle', async () => {
      await expect(employeesPage.pageSubtitle).toHaveText('Manage employees across all locations');
    });
  });

  test.describe('Stats Cards', () => {
    test('should display stat cards', async () => {
      const count = await employeesPage.statCards.count();
      expect(count).toBe(4);
    });

    test('should display Total stat', async () => {
      const card = employeesPage.statCards.filter({ hasText: 'Total' });
      await expect(card).toBeVisible();
    });

    test('should display Active stat', async () => {
      const card = employeesPage.statCards.filter({ hasText: 'Active' });
      await expect(card).toBeVisible();
    });
  });

  test.describe('Status Filter', () => {
    test('should display status toggle group', async () => {
      await expect(employeesPage.statusToggleGroup).toBeVisible();
    });

    test('should display All toggle', async () => {
      await expect(employeesPage.getStatusToggle('All')).toBeVisible();
    });

    test('should display Active toggle', async () => {
      await expect(employeesPage.getStatusToggle('Active')).toBeVisible();
    });

    test('should display On Leave toggle', async () => {
      await expect(employeesPage.getStatusToggle('On Leave')).toBeVisible();
    });

    test('should display Inactive toggle', async () => {
      await expect(employeesPage.getStatusToggle('Inactive')).toBeVisible();
    });
  });

  test.describe('Table Data', () => {
    test('should display employees table', async () => {
      await expect(employeesPage.dataTable.table).toBeVisible();
    });

    test('should display correct header columns', async () => {
      const headers = await employeesPage.dataTable.getHeaderTexts();
      const trimmed = headers.map((h) => h.trim());
      expect(trimmed).toContain('Employee');
      expect(trimmed).toContain('Job Title');
      expect(trimmed).toContain('Department');
      expect(trimmed).toContain('Time Zone');
      expect(trimmed).toContain('Status');
      expect(trimmed).toContain('Actions');
    });

    test('should display employee rows', async () => {
      const count = await employeesPage.dataTable.getRowCount();
      expect(count).toBe(mockEmployees.length);
    });

    test('should display first employee name and email', async () => {
      const row = employeesPage.dataTable.rows.first();
      await expect(row.locator('.employee-name')).toContainText(mockEmployees[0].firstName);
      await expect(row.locator('.employee-email')).toContainText(mockEmployees[0].email);
    });

    test('should display first employee job title', async () => {
      const jobTitle = await employeesPage.dataTable.getCellText(0, 1);
      expect(jobTitle).toBe(mockEmployees[0].jobTitle);
    });

    test('should display status chip for each row', async () => {
      const chip = employeesPage.getStatusChip(0);
      await expect(chip.first()).toBeVisible();
    });
  });

  test.describe('Actions', () => {
    test('should display view button for each row', async () => {
      const viewBtn = employeesPage.getViewButton(0);
      await expect(viewBtn).toBeVisible();
    });

    test('should display edit button for each row', async () => {
      const editBtn = employeesPage.getEditButton(0);
      await expect(editBtn).toBeVisible();
    });

    test('should open view dialog when clicking view button', async ({ page }) => {
      const viewBtn = employeesPage.getViewButton(0);
      await viewBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog.locator('[mat-dialog-title]')).toHaveText('Employee Details');
    });

    test('should open edit dialog when clicking edit button', async ({ page }) => {
      const editBtn = employeesPage.getEditButton(0);
      await editBtn.click();
      const dialog = page.locator('mat-dialog-container');
      await dialog.waitFor({ state: 'visible' });
      await expect(dialog.locator('[mat-dialog-title]')).toHaveText('Edit Employee');
    });
  });

  test.describe('Paginator', () => {
    test('should display paginator text', async ({ page }) => {
      const paginator = page.locator('.paginator-text');
      await expect(paginator).toContainText('Showing');
      await expect(paginator).toContainText('employees');
    });
  });
});
