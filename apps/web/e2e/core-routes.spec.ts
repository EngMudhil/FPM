import { test, expect } from '@playwright/test';

/**
 * Critical-path smoke for CORE modules.
 * Enable with E2E_ENABLED=1 and a running app (PLAYWRIGHT_BASE_URL optional).
 */
test.describe('core module routes', () => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_ENABLED, 'e2e not enabled');

  test('login page is reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|login|fpm/i })).toBeVisible();
  });

  test('unauthenticated dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
