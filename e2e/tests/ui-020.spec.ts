import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-020 — Active state transitions', { tag: '@smoke' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.CRITICAL);

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const stateSelect = form.getByRole('combobox', { name: 'State' });
    const addButton = form.getByRole('button', { name: 'Add item' });

    // --- Case 1: wanted → purchased ---

    const wantedName = `ui-020-wanted-${Date.now()}`;

    await nameInput.fill(wantedName);
    await stateSelect.selectOption('wanted');
    await addButton.click();

    const wantedItem = page.locator('li').filter({ hasText: wantedName }).first();
    const wantedItemState = wantedItem.getByRole('combobox', { name: 'State' });

    // Verify the item starts in the wanted state.
    await expect(wantedItemState).toHaveValue('wanted');

    // Verify the transition from wanted to purchased.
    await wantedItemState.selectOption('purchased');
    await expect(wantedItemState).toHaveValue('purchased');

    // --- Case 2: purchased → wanted ---

    const purchasedName = `ui-020-purchased-${Date.now()}`;

    await nameInput.fill(purchasedName);
    await stateSelect.selectOption('purchased');
    await addButton.click();

    const purchasedItem = page
      .locator('li')
      .filter({ hasText: purchasedName })
      .first();

    const purchasedItemState = purchasedItem.getByRole('combobox', {
      name: 'State',
    });

    // Verify that an item can be created directly in the purchased state.
    await expect(purchasedItemState).toHaveValue('purchased');

    // Verify the reverse transition back to wanted.
    await purchasedItemState.selectOption('wanted');
    await expect(purchasedItemState).toHaveValue('wanted');

    await page.reload();

    // Both state changes must persist after reload.
    await expect(
      page
        .locator('li')
        .filter({ hasText: wantedName })
        .first()
        .getByRole('combobox', { name: 'State' }),
    ).toHaveValue('purchased');

    await expect(
      page
        .locator('li')
        .filter({ hasText: purchasedName })
        .first()
        .getByRole('combobox', { name: 'State' }),
    ).toHaveValue('wanted');
  });
});