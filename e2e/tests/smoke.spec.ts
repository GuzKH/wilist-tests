import { test, expect } from '@playwright/test';

test('UI открывается', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('health отвечает 200', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
});
