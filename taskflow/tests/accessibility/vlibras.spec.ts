import { test, expect } from '@playwright/test';

test.describe('VLibras widget', () => {
  test('activates and injects widget, aria-live updates', async ({ page }) => {
    await page.goto('/');

    // Ensure the toolbar and checkbox exist
    const checkbox = page.getByLabel('Ativar VLibras');
    await expect(checkbox).toBeVisible();

    // Toggle on the VLibras checkbox
    await checkbox.check();

    // Aria-live should announce loading and success shortly
    await expect(page.getByRole('status')).toHaveText(/carregando|ativado/i, { timeout: 10000 });

    // The plugin usually adds nodes with 'vlibras' in id/class names and may add a global window.VLibras
    const el = await page.locator('[id*="vlibras"], [class*="vlibras"]').first();
    // either an element or the global object must be present
    const hasEl = await el.count() > 0;
    const hasGlobal = await page.evaluate(() => !!(window as any).VLibras);

    expect(hasEl || hasGlobal).toBeTruthy();

    // Toggle off and ensure the aria-live announces disabled
    await checkbox.uncheck();
    await expect(page.getByRole('status')).toHaveText(/desativado/i, { timeout: 5000 });
  });
});
