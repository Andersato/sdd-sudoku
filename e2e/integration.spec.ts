import { test, expect } from "@playwright/test";

test("sin ningún hook de prueba, elegir una dificultad termina en la pantalla de juego con 81 celdas", async ({
  page,
}) => {
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await expect(page.locator('[data-screen="game"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[role="gridcell"]')).toHaveCount(81);
});

test("flujo completo: elegir dificultad, seleccionar celdas y escribir con teclado y panel", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await expect(page.locator('[data-screen="game"]')).toBeVisible({ timeout: 10000 });

  const editableCells = page.locator('[role="gridcell"][data-fixed="false"]');
  expect(await editableCells.count()).toBeGreaterThanOrEqual(2);

  const first = editableCells.nth(0);
  const second = editableCells.nth(1);

  const firstRow = Number(await first.getAttribute("data-row"));
  const firstCol = Number(await first.getAttribute("data-col"));
  const secondRow = Number(await second.getAttribute("data-row"));
  const secondCol = Number(await second.getAttribute("data-col"));

  await first.click();
  await page.keyboard.press("5");
  await expect(first).toHaveText("5");

  const rowKey = secondRow >= firstRow ? "ArrowDown" : "ArrowUp";
  for (let i = 0; i < Math.abs(secondRow - firstRow); i++) {
    await page.keyboard.press(rowKey);
  }
  const colKey = secondCol >= firstCol ? "ArrowRight" : "ArrowLeft";
  for (let i = 0; i < Math.abs(secondCol - firstCol); i++) {
    await page.keyboard.press(colKey);
  }

  await expect(second).toHaveAttribute("aria-selected", "true");

  await page.locator('[data-digit="3"]').click();
  await expect(second).toHaveText("3");
  await expect(first).toHaveText("5");
});
