import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-007 — Two items with the same Name', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.MINOR);
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const listItems = page.locator('li');

    // Keep the test independent from pre-seeded items and previous tests.
    const beforeCount = await listItems.count();

    const name = `ui-007-${Date.now()}`;

    // Create the first item with the chosen name.
    await nameInput.fill(name);
    await addButton.click();

    // Create a second item with exactly the same name.
    await nameInput.fill(name);
    await addButton.click();

    // Duplicate names are allowed, so exactly two new items must be added.
    await expect(listItems).toHaveCount(beforeCount + 2);

    // Newly created items appear at the top, so both duplicates should be consecutive.
    await expect(listItems.nth(0)).toContainText(name);
    await expect(listItems.nth(1)).toContainText(name);
  });
});