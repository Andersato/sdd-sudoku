import { test, expect } from "@playwright/test";
import { callCount, installPuzzleHook, rejectPending, resolvePending } from "./helpers";

const PUZZLE: (number | null)[][] = [
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

test("elegir una dificultad pasa a la pantalla de juego cuando la generación tiene éxito", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await resolvePending(page, PUZZLE);
  await expect(page.locator('[data-screen="game"]')).toBeVisible();
});

test("muestra el aviso Generando... mientras la promesa no se resuelve", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await expect(page.getByRole("status")).toHaveText("Generando...");
});

test("muestra un mensaje de error con reintentar y las otras dos dificultades", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, "fallo de prueba");
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
  await expect(page.locator('[data-difficulty="medium"]')).toBeVisible();
  await expect(page.locator('[data-difficulty="hard"]')).toBeVisible();
});

test("reintentar tras un error relanza la generación y puede tener éxito", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, "fallo de prueba");
  await page.click('button:has-text("Reintentar")');
  await expect(page.getByRole("status")).toHaveText("Generando...");
  await resolvePending(page, PUZZLE);
  await expect(page.locator('[data-screen="game"]')).toBeVisible();
});

test("elegir otra dificultad desde la pantalla de error inicia una generación nueva", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, "fallo de prueba");
  await page.click('[data-difficulty="medium"]');
  await expect(page.getByRole("status")).toHaveText("Generando...");
  expect(await callCount(page)).toBe(2);
});

test("elegir una dificultad mientras se genera no inicia una segunda generación", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await expect(page.getByRole("status")).toHaveText("Generando...");
  await page.locator('[data-difficulty="easy"]').click({ force: true });
  await page.locator('[data-difficulty="medium"]').click({ force: true });
  expect(await callCount(page)).toBe(1);
});
