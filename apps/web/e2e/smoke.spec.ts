import { test, expect } from '@playwright/test';

test.describe('foundation', () => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_ENABLED, 'e2e not enabled');

  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
