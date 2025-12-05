import { test, expect } from '@playwright/test';

test.describe('Accessibility — High Contrast and primary buttons', () => {
  test('Landing CTA remains visible when Alto Contraste is toggled', async ({ page }) => {
    await page.goto('/');

    const cta = page.locator('a:has-text("Começar grátis"), button:has-text("Começar grátis")');
    await expect(cta).toBeVisible();

    // Toggle high contrast
    const hc = page.getByLabel('Ativar alto contraste');
    await hc.check();

    // Wait for aria-live status message to update
    await expect(page.getByRole('status')).toHaveText(/Alto contraste ativado/i);

    // CTA must still be visible and have a background color
    await expect(cta).toBeVisible();
    const bg = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    const color = await cta.evaluate((el) => getComputedStyle(el).color);
    const bodyColor = await page.evaluate(() => getComputedStyle(document.body).color);
    expect(color).not.toBe(bodyColor);
  });

  test('Dashboard primary controls remain visible under Alto Contraste', async ({ page }) => {
    await page.goto('/dashboard');

    // The dashboard page always renders an "Adicionar Tarefa" primary button in the header
    const add = page.locator('button:has-text("Adicionar Tarefa"), button.btn-primary');
    await expect(add).toBeVisible();

    // Toggle high contrast
    const hc = page.getByLabel('Ativar alto contraste');
    await hc.check();
    await expect(page.getByRole('status')).toHaveText(/Alto contraste ativado/i);

    // Button must still be visible and have a non-transparent background
    await expect(add).toBeVisible();
    const bg = await add.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });
});
