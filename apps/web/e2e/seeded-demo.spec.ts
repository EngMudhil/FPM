import { test, expect } from '@playwright/test';

test.describe('seeded auth + demo dashboard', () => {
  test('admin can sign in and see dashboard metrics', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@fpm.local');
    await page.getByLabel(/password/i).fill('FpmDevAdmin1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/current funded capital/i)).toBeVisible();
    await expect(page.getByText(/lifetime/i).first()).toBeVisible();
  });

  test('owner can open members settings', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('owner@fpm.local');
    await page.getByLabel(/password/i).fill('FpmDevOwner1!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.goto('/settings/members');
    await expect(page.getByRole('heading', { name: /members/i })).toBeVisible();
    await expect(page.getByText('admin@fpm.local')).toBeVisible();
    await expect(page.getByText('owner@fpm.local')).toBeVisible();
  });
});
