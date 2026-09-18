import { test, expect } from '@playwright/test';

test('UI-001 — Create item with Name only', async ({ page }) => {
  const name = `ui-001-${Date.now()}`;

  await page.goto('/');
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('button', { name: 'Add item' }).click();

  const firstItem = page.locator('li').first();

  // A newly created item must appear at the top of the list.
  await expect(firstItem).toContainText(name);

  // A new item starts in the default "wanted" state.
  await expect(
    firstItem.getByRole('combobox', { name: 'State' })
  ).toHaveValue('wanted');

  // Every created item must expose the removal action.
  await expect(
    firstItem.getByRole('button', { name: `Delete ${name}` })
  ).toBeVisible();

  // Without a link, the UI shows a non-link placeholder.
  await expect(firstItem).toContainText('No link');

  // After successful submission, the form is ready for another item.
  await expect(
    page.getByRole('textbox', { name: 'Name' })
  ).toHaveValue('');
});