import { test, expect, type Page } from "@playwright/test";
import { gotoGameScreen, installPuzzleHook, rejectPending } from "./helpers";
import { effectiveBackground, parseColor, sameRgb } from "./support/style";
import { relativeLuminance } from "../src/ui/contrast";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

async function pageBackground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test("el fondo de la pantalla inicial es gris azulado muy oscuro y no negro puro", async ({ page }) => {
  await page.goto("/");
  const bg = parseColor(await pageBackground(page));
  expect(relativeLuminance(bg)).toBeLessThanOrEqual(0.03);
  expect(bg.b).toBeGreaterThanOrEqual(bg.r);
  expect(bg.b).toBeGreaterThanOrEqual(bg.g);
  expect(sameRgb(bg, parseColor("#000000"))).toBe(false);
  expect(bg.a).toBe(1);
});

test("el fondo es el mismo mientras se genera, en la pantalla de error y en la de juego", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  const start = await pageBackground(page);

  await page.click('[data-difficulty="easy"]');
  await expect(page.getByRole("status")).toBeVisible();
  expect(await pageBackground(page)).toBe(start);

  await rejectPending(page, "fallo de prueba");
  await expect(page.getByRole("alert")).toBeVisible();
  expect(await pageBackground(page)).toBe(start);

  await page.click('[data-difficulty="medium"]');
  await page.evaluate((p) => (window as any).__sudokuPending__.shift().resolve(p), PUZZLE);
  await page.locator('[data-screen="game"]').waitFor();
  expect(await pageBackground(page)).toBe(start);
});

test("el tema no cambia con la preferencia clara del sistema", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const dark = await pageBackground(page);

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  expect(await pageBackground(page)).toBe(dark);

  await gotoGameScreen(page, PUZZLE);
  expect(await pageBackground(page)).toBe(dark);
});

test("effectiveBackground falla ante un fondo translúcido", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const el = document.createElement("p");
    el.id = "translucent";
    el.textContent = "texto";
    el.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
    document.body.appendChild(el);
  });
  await expect(effectiveBackground(page.locator("#translucent"))).rejects.toThrow(/translúcido/);
});
