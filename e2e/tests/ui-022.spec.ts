import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-022 — Archived state transitions', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.CRITICAL);

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const stateSelect = form.getByRole('combobox', { name: 'State' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const items = page.locator('li');
    const counter = page.getByText(/\b\d+ items?\b/);

    const beforeCount = await items.count();

    // --- Case 1: wanted → archived ---

    const wantedName = `ui-022-wanted-${Date.now()}`;

    await nameInput.fill(wantedName);
    await stateSelect.selectOption('wanted');
    await addButton.click();

    const wantedItem = items.filter({ hasText: wantedName }).first();
    const wantedItemState = wantedItem.getByRole('combobox', {
      name: 'State',
    });

    // Verify the transition from wanted to archived.
    await wantedItemState.selectOption('archived');
    await expect(wantedItemState).toHaveValue('archived');

    // Archiving must not remove the item from the list or counter.
    await expect(items).toHaveCount(beforeCount + 1);
    await expect(counter).toContainText(String(beforeCount + 1));

    // --- Case 2: purchased → archived ---

    const purchasedName = `ui-022-purchased-${Date.now()}`;

    await nameInput.fill(purchasedName);
    await stateSelect.selectOption('purchased');
    await addButton.click();

    const purchasedItem = items.filter({ hasText: purchasedName }).first();
    const purchasedItemState = purchasedItem.getByRole('combobox', {
      name: 'State',
    });

    // Verify that purchased items can also transition to archived.
    await purchasedItemState.selectOption('archived');
    await expect(purchasedItemState).toHaveValue('archived');

    // Both archived items must remain in the list.
    await expect(items).toHaveCount(beforeCount + 2);

    await page.reload();

    // Archived state must persist after reload for both transition paths.
    await expect(
      page
        .locator('li')
        .filter({ hasText: wantedName })
        .first()
        .getByRole('combobox', { name: 'State' }),
    ).toHaveValue('archived');

    await expect(
      page
        .locator('li')
        .filter({ hasText: purchasedName })
        .first()
        .getByRole('combobox', { name: 'State' }),
    ).toHaveValue('archived');
  });
});