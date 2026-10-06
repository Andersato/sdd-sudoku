import { test, expect, type Page } from "@playwright/test";
import { gotoGameScreen, installPuzzleHook, rejectPending } from "./helpers";

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

// Emulación de móvil (D11): sin la etiqueta meta viewport, la página se maquetaría a 980 px.
test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });

const FULLY = { ratio: 1 } as const;

async function expectMobileLayout(page: Page): Promise<void> {
  expect(await page.evaluate(() => window.innerWidth)).toBe(360);
  const noHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
  expect(noHorizontalScroll).toBe(true);
}

async function goToErrorScreen(page: Page, message: string): Promise<void> {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, message);
  await expect(page.getByRole("alert")).toBeVisible();
}

test("a 360x640 el tablero y el panel caben sin desplazarse", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  await expectMobileLayout(page);

  await expect(page.locator('[role="gridcell"]')).toHaveCount(81);
  await expect(page.getByRole("grid")).toBeInViewport(FULLY);
  for (const row of [0, 8]) {
    for (const col of [0, 8]) {
      await expect(page.locator(`[data-row="${row}"][data-col="${col}"]`)).toBeInViewport(FULLY);
    }
  }
  for (let digit = 1; digit <= 9; digit++) {
    await expect(page.locator(`[data-digit="${digit}"]`)).toBeInViewport(FULLY);
  }
  await expect(page.locator('[data-action="erase"]')).toBeInViewport(FULLY);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("a 360x640 el botón Nueva partida es visible y usable sin desplazamiento horizontal", async ({ page }) => {
  await gotoGameScreen(page, KNOWN_PUZZLE);
  const newGame = page.getByRole("button", { name: "Nueva partida" });
  await newGame.scrollIntoViewIfNeeded();
  await expect(newGame).toBeInViewport(FULLY);
  await expectMobileLayout(page);

  await newGame.click();
  await expect(page.locator('[data-screen="start"]')).toBeVisible();
});

test("a 360x640 la pantalla inicial muestra el título y las tres dificultades", async ({ page }) => {
  await page.goto("/");
  await expectMobileLayout(page);
  await expect(page.getByRole("heading", { name: "SDD Sudoku" })).toBeInViewport(FULLY);
  for (const d of ["easy", "medium", "hard"]) {
    await expect(page.locator(`[data-difficulty="${d}"]`)).toBeInViewport(FULLY);
  }
});

test("a 360x640 el aviso de generación y las dificultades desactivadas son visibles", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await expect(page.getByRole("status")).toBeInViewport(FULLY);
  for (const d of ["easy", "medium", "hard"]) {
    await expect(page.locator(`[data-difficulty="${d}"]`)).toBeDisabled();
    await expect(page.locator(`[data-difficulty="${d}"]`)).toBeInViewport(FULLY);
  }
  await expectMobileLayout(page);
});

test("a 360x640 la pantalla de error muestra el mensaje, Reintentar y las dificultades", async ({ page }) => {
  await goToErrorScreen(page, "No se pudo generar el sudoku. Inténtalo de nuevo.");
  await expectMobileLayout(page);
  await expect(page.getByRole("alert")).toBeInViewport(FULLY);
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeInViewport(FULLY);
  for (const d of ["easy", "medium", "hard"]) {
    await expect(page.locator(`[data-difficulty="${d}"]`)).toBeInViewport(FULLY);
  }
});

test("a 360x640 un mensaje de error largo se reparte en varias líneas", async ({ page }) => {
  const longWord = "x".repeat(60);
  const message = `${"Fallo al generar el sudoku por un motivo inesperado. ".repeat(3)}${longWord} `
    .padEnd(250, "y")
    .slice(0, 250);
  expect(message).toHaveLength(250);

  await goToErrorScreen(page, message);
  await expectMobileLayout(page);

  const alert = page.getByRole("alert");
  const { height, lineHeight } = await alert.evaluate((el) => {
    const s = getComputedStyle(el);
    return { height: el.getBoundingClientRect().height, lineHeight: parseFloat(s.lineHeight) || 20 };
  });
  expect(height).toBeGreaterThan(lineHeight * 2);
});
