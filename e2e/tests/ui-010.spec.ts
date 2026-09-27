import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-010 — List survives a page reload', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.CRITICAL);

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const items = page.locator('li');

    const name = `ui-010-${Date.now()}`;

    // Create a uniquely identifiable item so we can find the same item after reload.
    await nameInput.fill(name);
    await addButton.click();

    const createdItem = items.filter({ hasText: name }).first();

    // Confirm the item was created before testing persistence.
    await expect(createdItem).toContainText(name);

    await page.reload();

    // Find the item by its unique name instead of assuming it is still first.
    const reloadedItem = items.filter({ hasText: name }).first();

    // The same item must still be present after the page is reloaded.
    await expect(reloadedItem).toContainText(name);
  });
});