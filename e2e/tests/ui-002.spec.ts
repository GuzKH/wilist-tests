import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';  

test('UI-002 — Create item with Name + Link', { tag: '@regression' }, async ({ page }) => {
  const name = `ui-002-${Date.now()}`;
  const link = 'https://example.com';

  await page.goto('/');

  const form = page.locator('form');
  await form.getByRole('textbox', { name: 'Name' }).fill(name);
  await form.getByRole('textbox', { name: 'Link' }).fill(link);
  await form.getByRole('button', { name: 'Add item' }).click();

  const firstItem = page.locator('li').first();

  // The newly created item must appear at the top of the list.
  await expect(firstItem).toContainText(name);

  // Creating an item with a link must not change the default state.
  await expect(
    firstItem.getByRole('combobox', { name: 'State' })
  ).toHaveValue('wanted');

  // When a link is provided, it must be rendered as an actual link.
  const itemLink = firstItem.getByRole('link');
  await expect(itemLink).toBeVisible();

  // The rendered href must exactly match the value entered by the user.
  await expect(itemLink).toHaveAttribute('href', link);
});