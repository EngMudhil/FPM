import { test, expect } from '@playwright/test';

/**
 * Minimal smoke check that the foundation app responds.
 * Requires a running `pnpm dev` or `pnpm start` (set PLAYWRIGHT_BASE_URL if needed).
 * Skipped by default in CI until a dedicated e2e job is configured with a server.
 */
test.describe('foundation', () => {
  test.skip(!process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_ENABLED, 'e2e not enabled');

  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /repository foundation ready/i })).toBeVisible();
  });
});
