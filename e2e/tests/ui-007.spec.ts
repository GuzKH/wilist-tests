import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-007 — Two items with the same Name', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.MINOR);

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const listItems = page.locator('li');

    // Keep the test independent from pre-seeded items and previous tests.
    // (the `page` fixture already waited for the initial load to finish —
    // see tests/fixtures.ts for why that wait is needed)
    const beforeCount = await listItems.count();

    const name = `ui-007-${Date.now()}`;

    // Create the first item with the chosen name.
    await nameInput.fill(name);
    await addButton.click();

    // Wait until the first submission is actually rendered before submitting the
    // second one. Otherwise "Add item" is still disabled (disabled={isPending},
    // added for the UI-015 fix) and the second click is silently dropped.
    // Confirmed 27.09 (--repeat-each=5): this is the only real cause of flakiness
    // in this test — not shared list state, UI-003/004/014/030 were green 20/20.
    await expect(listItems).toHaveCount(beforeCount + 1);

    // Create a second item with exactly the same name.
    await nameInput.fill(name);
    await addButton.click();

    // Duplicate names are allowed, so exactly two new items must be added.
    await expect(listItems).toHaveCount(beforeCount + 2);

    // Both duplicates must exist — checked by name, not by position, since sort
    // order among items with identical/near-identical createdDate isn't guaranteed.
    await expect(listItems.filter({ hasText: name })).toHaveCount(2);
  });
});
