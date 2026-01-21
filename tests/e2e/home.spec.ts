import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Lauri Maila/);
});

test('has main content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
});
