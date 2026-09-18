import { test, expect } from '@playwright/test';

test.describe('wilist UI', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Your list' })).toBeVisible();
  });
});