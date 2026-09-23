import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Your list' })).toBeVisible();
  });
});