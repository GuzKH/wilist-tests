import { test as base, expect } from '@playwright/test';

/**
 * Overrides the built-in `page` fixture so every test gets a page that is
 * already on '/' and has finished its initial load.
 *
 * Why: the list loads asynchronously and shows "Loading…" until it renders;
 * during that window `page.locator('li')` (and any count taken from it)
 * reads 0 regardless of how many items actually exist. With the store never
 * reset across runs, the initial fetch gets slower as it accumulates items,
 * so this race becomes more likely to actually bite over time — found 27.09
 * in ui-007 once the store reached 18+ items.
 *
 * Import `test`/`expect` from this file instead of '@playwright/test' and
 * drop the manual `await page.goto('/')` — this fixture already did it.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.goto('/');
    await expect(page.getByText('Loading…')).toHaveCount(0);
    await use(page);
  },
});

export { expect };
