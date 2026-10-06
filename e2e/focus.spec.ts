import { test, expect, type Page } from "@playwright/test";
import { gotoGameScreen } from "./helpers";
import { computed, contrastRatio, expectReducedMotion, paletteRgba, parseColor, sameRgb } from "./support/style";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

async function backToGridWithKeyboard(page: Page): Promise<void> {
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-digit="1"]')).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("grid")).toBeFocused();
}

test.beforeEach(async ({ page }) => {
  await expectReducedMotion(page);
  await gotoGameScreen(page, PUZZLE);
});

test("volver al tablero con el teclado muestra un indicador de foco de al menos 3:1", async ({ page }) => {
  await backToGridWithKeyboard(page);

  const style = await computed(page.getByRole("grid"), ["outline-style", "outline-width", "outline-color"]);
  const accent = await paletteRgba(page, "accent");
  const bg = await paletteRgba(page, "bg");
  expect(style["outline-style"]).toBe("solid");
  expect(parseFloat(style["outline-width"])).toBeGreaterThan(0);
  expect(sameRgb(parseColor(style["outline-color"]), accent)).toBe(true);
  expect(contrastRatio(parseColor(style["outline-color"]), bg)).toBeGreaterThanOrEqual(3);
});

test("el foco del tablero no se confunde con la selección", async ({ page }) => {
  // Orden fijo: clic, Tab, Mayúsculas+Tab. Ninguna de esas teclas redibuja la pantalla.
  await page.locator('[data-row="4"][data-col="4"]').click();
  await backToGridWithKeyboard(page);

  const grid = await computed(page.getByRole("grid"), ["outline-style", "outline-offset"]);
  expect(grid["outline-style"]).toBe("solid");
  // El anillo rodea el tablero por fuera.
  expect(parseFloat(grid["outline-offset"])).toBeGreaterThan(0);

  const selected = await computed(page.locator('[data-row="4"][data-col="4"]'), [
    "outline-style",
    "outline-offset",
  ]);
  expect(selected["outline-style"]).toBe("solid");
  expect(parseFloat(selected["outline-offset"])).toBeLessThan(0);
});
