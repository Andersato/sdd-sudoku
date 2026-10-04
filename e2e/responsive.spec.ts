import { test, expect } from "@playwright/test";
import { gotoGameScreen } from "./helpers";

const KNOWN_PUZZLE: (number | null)[][] = [
  [5, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
];

test.use({ viewport: { width: 360, height: 640 } });

test("a 360px de ancho no hay scroll horizontal y el tablero y el panel son visibles", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);

  const noHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHorizontalScroll).toBe(true);

  await expect(page.locator('[role="gridcell"]')).toHaveCount(81);
  for (const row of [0, 8]) {
    for (const col of [0, 8]) {
      await expect(page.locator(`[data-row="${row}"][data-col="${col}"]`)).toBeInViewport();
    }
  }

  for (let digit = 1; digit <= 9; digit++) {
    await expect(page.locator(`[data-digit="${digit}"]`)).toBeInViewport();
  }
  await expect(page.locator('[data-action="erase"]')).toBeInViewport();
});
