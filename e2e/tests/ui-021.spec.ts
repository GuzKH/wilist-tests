import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-021 — Editing the Name of an existing item', { tag: '@regression' }, async ({ page }) => {
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });

    const name = `ui-021-${Date.now()}`;

    await nameInput.fill(name);
    await addButton.click();

    const item = page.locator('li').filter({ hasText: name }).first();
    const itemName = item.locator('p');

    // The displayed item name must be plain text, not an editable control.
    await expect(itemName).not.toHaveAttribute('contenteditable', 'true');
    await expect(item.getByRole('textbox')).toHaveCount(0);

    // The existing item name must remain unchanged after interaction.
    await itemName.click();
    await expect(itemName).toHaveText(name);
  });
});