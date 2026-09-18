import { test, expect } from '@playwright/test';

test.describe('wilist UI', () => {
  test('UI-005 — Long values and special characters', async ({ page }) => {
    await page.goto('/');

    const form = page.locator('form');
    const nameInput = form.getByRole('textbox', { name: 'Name' });
    const linkInput = form.getByRole('textbox', { name: 'Link' });
    const addButton = form.getByRole('button', { name: 'Add item' });

    const name = '!@#$%^&45678ERTYUIO. &*()FGHJKL VBNM<45678';
    const link =
      'https://example.com/very/long/path?query=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890&x=1&y=2&z=3#fragment';

    // Use long and special-character values to verify they are accepted and preserved.
    await nameInput.fill(name);
    await linkInput.fill(link);
    await addButton.click();

    const firstItem = page.locator('li').first();

    // The exact Name value must survive submission without unexpected normalization.
    await expect(firstItem).toContainText(name);

    // A long URL must still be rendered as a link with the complete original href.
    const linkElement = firstItem.getByRole('link');
    await expect(linkElement).toHaveAttribute('href', link);
  });
});