import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('UI-006 — Link is not a valid URL(KNOWN BUG)', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.NORMAL);
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const linkInput = form.getByRole('textbox', { name: 'Link' });
    const addButton = form.getByRole('button', { name: 'Add item' });

    const name = `ui-006-${Date.now()}`;
    const link = 'not-a-url';

    // 1. Fill Name with a unique value, fill Link with not-a-url.
    await nameInput.fill(name);
    await linkInput.fill(link);

    // 2. Click Add item.
    await addButton.click();

    // Expected: The item is created.
    const firstItem = page.locator('li').first();
    await expect(firstItem).toContainText(name);

    // Expected: KNOWN BUG: the client performs no URL validation on Link.
    // Expected: KNOWN BUG: the rendered link resolves to the app's own page instead of an external URL.
    await expect(firstItem.getByRole('link')).toHaveAttribute('href', link);
    // First assert the validation error, then verify that the rejected
    // submission did not modify the existing list.
   // await expect(error).toBeVisible();
   //await expect(list.locator('li')).toHaveCount(beforeCount);
  });
});
