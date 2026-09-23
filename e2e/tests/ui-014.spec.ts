import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-014 — Enter in the Name field submits the form', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.NORMAL);
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const items = page.locator('li');

    const name = `ui-014-${Date.now()}`;

    // Capture the current count because the store is shared across the test run.
    const beforeCount = await items.count();

    await nameInput.fill(name);

    // Pressing Enter should trigger the same form submission as clicking Add item.
    await nameInput.press('Enter');

    // Enter must create exactly one new item.
    await expect(items).toHaveCount(beforeCount + 1);

    // The newly created item must appear at the top of the list.
    await expect(items.first()).toContainText(name);

    // A successful submission must clear the Name field.
    await expect(nameInput).toHaveValue('');
  });
});