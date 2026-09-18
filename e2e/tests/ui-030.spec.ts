import { test, expect } from '@playwright/test';

test.describe('wilist UI', () => {
  test('UI-030 — Remove an item', async ({ page }) => {
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const items = page.locator('li');

    const firstName = `ui-030-a-${Date.now()}`;
    const secondName = `ui-030-b-${Date.now()}`;

    // The store is shared across the test run, so use the current count as the baseline.
    const beforeCount = await items.count();

    // Create the first item and wait until it is actually rendered.
    await nameInput.fill(firstName);
    await addButton.click();
    await expect(items.filter({ hasText: firstName })).toHaveCount(1);

    // Create the second item and wait until it is actually rendered.
    await nameInput.fill(secondName);
    await addButton.click();
    await expect(items.filter({ hasText: secondName })).toHaveCount(1);

    // Two successful submissions must increase the existing list by exactly two.
    await expect(items).toHaveCount(beforeCount + 2);

    // Target the specific item instead of relying on its position in the shared list.
    const itemToDelete = items.filter({ hasText: firstName }).first();

    await itemToDelete
      .getByRole('button', { name: `Delete ${firstName}` })
      .click();

    // Removing one item must decrease the list by exactly one.
    await expect(items).toHaveCount(beforeCount + 1);

    // The other item must remain after the deletion.
    await expect(items.filter({ hasText: secondName })).toHaveCount(1);

    // The deleted item must no longer be present.
    await expect(items.filter({ hasText: firstName })).toHaveCount(0);
  });
});