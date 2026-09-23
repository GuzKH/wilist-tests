import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';  


test('UI-003 — Submit with empty Name', { tag: '@regression' }, async ({ page }) => {
  // TODO: set severity from the Priority column in ui-cases.md
  await allure.severity(allure.Severity.CRITICAL);
  await page.goto('/');

  const form = page.locator('form');
  const nameInput = form.getByRole('textbox', { name: 'Name' });
  const linkInput = form.getByRole('textbox', { name: 'Link' });

  const beforeCount = await page.locator('li').count();

  await linkInput.fill('https://test.com');
  await form.getByRole('button', { name: 'Add item' }).click();

  // The required Name field must block submission through native browser validation.
  await expect(nameInput).toHaveJSProperty('validity.valid', false);

  // Because validation rejected the submission, no new item must be added.
  await expect(page.locator('li')).toHaveCount(beforeCount);
});