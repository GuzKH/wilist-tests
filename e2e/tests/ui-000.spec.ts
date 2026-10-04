import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';    


test('UI-000 Default state of the add form', { tag: '@smoke' }, async ({ page }) => {
  
    await allure.severity(allure.Severity.CRITICAL);

  // Start from a clean store so the default empty-list state is deterministic.
  const response = await page.request.get('/wish-items');
  const serverItems = await response.json();

  for (const item of serverItems) {
    await page.request.delete(`/wish-items/${item.id}`);
  }

  // The fixture opened '/' BEFORE we cleared the store, so the page still
  // shows the old items. Reload to render the now-empty list.
  await page.reload();
  // Wait for the async list load to finish (same check as in fixtures.ts).
  await expect(page.getByText('Loading…')).toHaveCount(0);

  // Everything related to the add form is scoped to the form.
  // State selects also exist inside each list item.
  const form = page.locator('form');

  const nameInput = form.getByRole('textbox', { name: 'Name' });
  const linkInput = form.getByRole('textbox', { name: 'Link' });
  const stateSelect = form.getByRole('combobox', { name: 'State' });
  const addButton = form.getByRole('button', { name: 'Add item' });

  // Form controls.
  await expect(nameInput).toBeVisible();
  await expect(linkInput).toBeVisible();
  await expect(stateSelect).toBeVisible();
  await expect(addButton).toBeVisible();

  // Default values.
  await expect(nameInput).toHaveValue('');
  await expect(linkInput).toHaveValue('');
  await expect(stateSelect).toHaveValue('wanted');

  // Placeholders.
  await expect(nameInput).toHaveAttribute('placeholder', 'Mechanical keyboard');
  await expect(linkInput).toHaveAttribute('placeholder', 'https://…');

  // Header content.
  await expect(page.getByText('wilist', { exact: true })).toBeVisible();
  await expect(page.getByText('Things you want, in one place.')).toBeVisible();
  await expect(
    page.getByText(
      'Add links, track what you still want, and archive the rest.'
    )
  ).toBeVisible();

  // The list heading is visible even when there are no items.
  await expect(
    page.getByRole('heading', { name: 'Your list' })
  ).toBeVisible();

  // An empty store must show the dedicated empty state instead of an empty list.
  await expect(
    page.getByText('No wish items yet. Add your first one above.', {
      exact: true,
    })
  ).toBeVisible();

  // The counter must reflect the empty list.
  await expect(page.getByText('0')).toBeVisible();

  // There must be no actual list items in the initial state.
  await expect(page.locator('li')).toHaveCount(0);
});