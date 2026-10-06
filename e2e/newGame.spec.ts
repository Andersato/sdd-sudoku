import { test, expect } from "@playwright/test";
import { almostSolvedPuzzle, gotoGameScreen } from "./helpers";

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

test("sin números puestos, Nueva partida vuelve directamente sin diálogo", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  let dialogShown = false;
  page.on("dialog", () => {
    dialogShown = true;
  });
  await page.click('button:has-text("Nueva partida")');
  await expect(page.locator('[data-screen="start"]')).toBeVisible();
  expect(dialogShown).toBe(false);
});

test("con un número puesto, Nueva partida pide confirmación", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="1"][data-col="1"]').click();
  await page.keyboard.press("7");

  let dialogMessage = "";
  page.on("dialog", (dialog) => {
    dialogMessage = dialog.message();
    void dialog.accept();
  });
  await page.click('button:has-text("Nueva partida")');
  await expect(page.locator('[data-screen="start"]')).toBeVisible();
  expect(dialogMessage).toBe(
    "Hay una partida en curso. Si empiezas una nueva, perderás lo que has escrito. ¿Quieres continuar?",
  );
});

test("cancelar el diálogo mantiene la partida en curso intacta", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="1"][data-col="1"]').click();
  await page.keyboard.press("7");

  page.on("dialog", (dialog) => {
    void dialog.dismiss();
  });
  await page.click('button:has-text("Nueva partida")');
  await expect(page.locator('[data-screen="game"]')).toBeVisible();
  await expect(page.locator('[data-row="1"][data-col="1"]')).toHaveText("7");
});

test("escribir y borrar un número no pide confirmación", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await page.locator('[data-row="1"][data-col="1"]').click();
  await page.keyboard.press("7");
  await page.keyboard.press("Backspace");

  let dialogShown = false;
  page.on("dialog", () => {
    dialogShown = true;
  });
  await page.click('button:has-text("Nueva partida")');
  await expect(page.locator('[data-screen="start"]')).toBeVisible();
  expect(dialogShown).toBe(false);
});

test("con la partida completada, Nueva partida vuelve directamente sin diálogo", async ({ page }) => {
  await gotoGameScreen(page, almostSolvedPuzzle());
  await page.locator('[data-row="0"][data-col="2"]').click();
  await page.keyboard.press("4");
  await expect(page.getByTestId("game-complete")).toBeVisible();

  let dialogShown = false;
  page.on("dialog", (dialog) => {
    dialogShown = true;
    void dialog.dismiss();
  });
  await page.click('button:has-text("Nueva partida")');
  await expect(page.locator('[data-screen="start"]')).toBeVisible();
  expect(dialogShown).toBe(false);
});
