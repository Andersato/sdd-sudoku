import { test, expect } from "@playwright/test";
import { gotoGameScreen } from "./helpers";

const KNOWN_PUZZLE: (number | null)[][] = [
  [5, null, 3, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
];

test("las celdas fijas tienen data-fixed=true y el resto false", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("data-fixed", "true");
  await expect(page.locator('[data-row="0"][data-col="2"]')).toHaveAttribute("data-fixed", "true");
  await expect(page.locator('[data-row="0"][data-col="1"]')).toHaveAttribute("data-fixed", "false");
  await expect(page.locator('[data-row="8"][data-col="8"]')).toHaveAttribute("data-fixed", "false");
});

test("hacer clic en una celda fija y luego en una editable deja seleccionada solo la segunda", async ({
  page,
}) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="0"][data-col="0"]').click();
  await page.locator('[data-row="1"][data-col="1"]').click();
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("aria-selected", "false");
  await expect(page.locator('[data-row="1"][data-col="1"]')).toHaveAttribute("aria-selected", "true");
});

test("una flecha sin selección previa selecciona la esquina superior izquierda", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("aria-selected", "true");
});

test("flecha abajo mueve la selección a la celda adyacente", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator('[data-row="1"][data-col="0"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("aria-selected", "false");
});

test("flecha arriba mueve la selección a la celda adyacente", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("aria-selected", "true");
});

test("flecha derecha mueve la selección a la celda adyacente", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-row="0"][data-col="1"]')).toHaveAttribute("aria-selected", "true");
});

test("flecha izquierda mueve la selección a la celda adyacente", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveAttribute("aria-selected", "true");
});

test("una flecha hacia el borde del tablero no hace scroll la página", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.keyboard.press("ArrowUp");
  const before = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  await page.keyboard.press("ArrowUp");
  const after = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  expect(after).toEqual(before);
});

test("una celda fija y una editable tienen un estilo computado distinto", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  const fixedColor = await page
    .locator('[data-row="0"][data-col="0"]')
    .evaluate((el) => getComputedStyle(el).color);
  const editableColor = await page
    .locator('[data-row="0"][data-col="1"]')
    .evaluate((el) => getComputedStyle(el).color);
  expect(fixedColor).not.toBe(editableColor);
});
