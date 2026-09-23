import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test('UI открывается', async ({ page }) => {
  // TODO: set severity from the Priority column in ui-cases.md
  await allure.severity(allure.Severity.NORMAL);
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('health отвечает 200', async ({ request }) => {
  // TODO: set severity from the Priority column in ui-cases.md
  await allure.severity(allure.Severity.NORMAL);
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
});
