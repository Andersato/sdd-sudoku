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

test("escribir con teclado físico y con el panel en la misma celda produce el mismo resultado", async ({
  page,
}) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="1"][data-col="1"]').click();
  await page.keyboard.press("7");
  await expect(page.locator('[data-row="1"][data-col="1"]')).toHaveText("7");

  await page.locator('[data-row="2"][data-col="2"]').click();
  await page.locator('[data-digit="7"]').click();
  await expect(page.locator('[data-row="2"][data-col="2"]')).toHaveText("7");
});

test("una tecla no válida no cambia nada", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="1"][data-col="1"]').click();
  await page.keyboard.press("a");
  await expect(page.locator('[data-row="1"][data-col="1"]')).toHaveText("");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("un número con una celda fija seleccionada no cambia nada", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="0"][data-col="0"]').click();
  await page.keyboard.press("3");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveText("5");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("un número sin ninguna celda seleccionada no cambia nada", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-digit="3"]').click();
  await expect(page.locator('[role="gridcell"][data-row="1"][data-col="1"]')).toHaveText("");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("borrar una celda fija seleccionada no cambia nada", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="0"][data-col="0"]').click();
  await page.keyboard.press("Backspace");
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveText("5");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("borrar sin ninguna celda seleccionada no cambia nada", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-action="erase"]').click();
  await expect(page.locator('[data-row="0"][data-col="0"]')).toHaveText("5");
  await expect(page.getByRole("alert")).toHaveCount(0);
});
