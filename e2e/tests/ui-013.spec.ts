import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-013 — Item ordering in the list', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.CRITICAL);
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const items = page.locator('li');

    const timestamp = Date.now();

    const names = [
      `ui-013-a-${timestamp}`,
      `ui-013-b-${timestamp}`,
      `ui-013-c-${timestamp}`,
    ];

    // Create each item sequentially and wait for it to appear before creating the next one.
    for (const name of names) {
      await nameInput.fill(name);
      await addButton.click();

      await expect(items.filter({ hasText: name })).toHaveCount(1);
    }

    // Locate the three items created by this test using their exact unique names.
    const itemA = items.filter({ hasText: names[0] }).first();
    const itemB = items.filter({ hasText: names[1] }).first();
    const itemC = items.filter({ hasText: names[2] }).first();

    // Read the final list order after all three items have been created.
    const currentNames = await items.allTextContents();

    const positionA = currentNames.findIndex((text) => text.includes(names[0]));
    const positionB = currentNames.findIndex((text) => text.includes(names[1]));
    const positionC = currentNames.findIndex((text) => text.includes(names[2]));

    // All three items must be present in the final list.
    await expect(itemA).toContainText(names[0]);
    await expect(itemB).toContainText(names[1]);
    await expect(itemC).toContainText(names[2]);

    // Newly created items are expected to appear at the top in reverse creation order.
    expect(positionC).toBeLessThan(positionB);
    expect(positionB).toBeLessThan(positionA);
  });
});