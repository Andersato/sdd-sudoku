import { test, expect } from "@playwright/test";
import { almostSolvedPuzzle, installPuzzleHook, resolvePending } from "./helpers";

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

test("partida de principio a fin: conflicto, corrección, completado, bloqueo y nueva partida", async ({ page }) => {
  const start = new Date("2026-01-01T10:00:00Z");
  const cell = (row: number, col: number) => page.locator(`[data-row="${row}"][data-col="${col}"]`);
  const timer = page.getByTestId("timer");
  const message = page.getByTestId("game-complete");

  await installPuzzleHook(page);
  await page.clock.install({ time: start });
  await page.goto("/");
  // Margen amplio: pauseAt falla si la carga de la página ya ha superado ese instante.
  await page.clock.pauseAt(new Date(start.getTime() + 60_000));
  await page.click('[data-difficulty="easy"]');
  await resolvePending(page, almostSolvedPuzzle([[0, 2], [8, 8]]));
  await expect(timer).toHaveText("00:00");

  // Conflicto: un 5 en (0,2) repite el 5 fijo de (0,0).
  await page.clock.fastForward(30_000);
  await cell(0, 2).click();
  await page.keyboard.press("5");
  await expect(cell(0, 2)).toHaveAttribute("data-conflict", "true");
  await expect(cell(0, 0)).toHaveAttribute("data-conflict", "true");

  // Corrección y última casilla.
  await page.keyboard.press("4");
  await expect(page.locator('[data-conflict="true"]')).toHaveCount(0);
  await page.clock.fastForward(60_000);
  await cell(8, 8).click();
  await page.locator('[data-digit="9"]').click();

  // Completada: mensaje con el tiempo y temporizador parado.
  await expect(message.locator("p").nth(0)).toHaveText("¡Sudoku resuelto!");
  await expect(message.locator("p").nth(1)).toHaveText("Tiempo: 01:30");
  await page.clock.fastForward(20_000);
  await expect(timer).toHaveText("01:30");

  // Bloqueo: no se puede escribir ni borrar.
  await page.keyboard.press("1");
  await page.keyboard.press("Backspace");
  await expect(cell(8, 8)).toHaveText("9");

  // Nueva partida sin diálogo y temporizador a cero.
  let dialogShown = false;
  page.on("dialog", (dialog) => {
    dialogShown = true;
    void dialog.dismiss();
  });
  await page.click('button:has-text("Nueva partida")');
  expect(dialogShown).toBe(false);
  await page.click('[data-difficulty="easy"]');
  await resolvePending(page, almostSolvedPuzzle());
  await expect(timer).toHaveText("00:00");
  await expect(message).toHaveCount(0);
});
