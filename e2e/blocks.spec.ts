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

test("el borde vertical entre cuadros de 3x3 es más grueso que el borde entre celdas del mismo cuadro", async ({
  page,
}) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);

  const blockBorder = await page
    .locator('[data-row="0"][data-col="2"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderRightWidth));
  const cellBorder = await page
    .locator('[data-row="0"][data-col="0"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderRightWidth));

  expect(blockBorder).toBeGreaterThan(cellBorder);
});

test("el borde horizontal entre cuadros de 3x3 es más grueso que el borde entre celdas del mismo cuadro", async ({
  page,
}) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);

  const blockBorder = await page
    .locator('[data-row="2"][data-col="0"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderBottomWidth));
  const cellBorder = await page
    .locator('[data-row="0"][data-col="0"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).borderBottomWidth));

  expect(blockBorder).toBeGreaterThan(cellBorder);
});

test("el panel de números no deja ningún botón suelto en una fila distinta", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);

  const tops = await page
    .locator('[data-testid="number-panel"] button')
    .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().top));

  const rows = new Map<number, number>();
  for (const top of tops) {
    const rounded = Math.round(top);
    rows.set(rounded, (rows.get(rounded) ?? 0) + 1);
  }

  const counts = [...rows.values()];
  expect(counts.length).toBe(2);
  expect(counts[0]).toBe(counts[1]);
});
