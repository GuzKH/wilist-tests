import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-008 — Leading and trailing spaces in Name', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });

    const value = `  test-${Date.now()}  `;
    const trimmed = value.trim();

    // Verify that the application normalizes leading and trailing whitespace.
    await nameInput.fill(value);
    await addButton.click();

    // The newly created item appears first and must contain the normalized name exactly.
    const firstItemName = page.locator('li').first().locator('p');
    await expect(firstItemName).toHaveText(trimmed);
  });
});