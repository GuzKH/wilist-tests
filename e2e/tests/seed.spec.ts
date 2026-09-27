import { test, expect } from './fixtures';
import * as allure from 'allure-js-commons';

test.describe('wilist UI', () => {
  test('seed', async ({ page }) => {
    // TODO: set severity from the Priority column in ui-cases.md
    await allure.severity(allure.Severity.NORMAL);
    await expect(page.getByRole('heading', { name: 'Your list' })).toBeVisible();
  });
});