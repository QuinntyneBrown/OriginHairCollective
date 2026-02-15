import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './projects/teams/e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4202',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npx ng serve teams --port 4202',
    url: 'http://localhost:4202',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
