import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';  

test.describe('wilist UI', () => {
  test('UI-004 — Name containing only whitespace', { tag: '@regression' }, async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.CRITICAL);
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const addButton = form.getByRole('button', { name: 'Add item' });
    const list = page.locator('ul');

    const beforeCount = await list.locator('li').count();

    // Whitespace-only input should be rejected by the application's business validation.
    await nameInput.fill('   ');
    await addButton.click();

    // Check the rejection reason first so the test failure is diagnostic.
    const error = page.getByText('name is required', { exact: true });
    await expect(error).toBeVisible();

    // A rejected submission must not add an item to the existing list.
    await expect(list.locator('li')).toHaveCount(beforeCount);
  });
});