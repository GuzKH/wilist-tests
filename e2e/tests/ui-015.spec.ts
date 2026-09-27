import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  // KNOWN BUG: double-clicking "Add item" can create duplicate items.
  test('UI-015 — Double click on Add item', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.NORMAL);

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const items = page.locator('li');

    const name = `ui-015-${Date.now()}`;

    // The store is shared across the test run, so use the current count as the baseline.
    const beforeCount = await items.count();

    await nameInput.fill(name);

    // Expected behavior: one double-click must create exactly one item.
    await addButton.dblclick();

    // The submission must create one and only one new list item.
    await expect(items).toHaveCount(beforeCount + 1);

    // Verify that the item created by this test exists exactly once.
    await expect(items.filter({ hasText: name })).toHaveCount(1);
  });
});