import type { Page } from "@playwright/test";

export async function installPuzzleHook(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__sudokuCalls__ = 0;
    (window as any).__sudokuPending__ = [];
    (window as any).__sudokuTestGeneratePuzzle__ = () => {
      (window as any).__sudokuCalls__ += 1;
      return new Promise((resolve, reject) => {
        (window as any).__sudokuPending__.push({ resolve, reject });
      });
    };
  });
}

export async function resolvePending(page: Page, puzzle: (number | null)[][]): Promise<void> {
  await page.evaluate((p) => {
    const pending = (window as any).__sudokuPending__.shift();
    pending.resolve(p);
  }, puzzle);
}

export async function rejectPending(page: Page, message: string): Promise<void> {
  await page.evaluate((m) => {
    const pending = (window as any).__sudokuPending__.shift();
    pending.reject(new Error(m));
  }, message);
}

export async function callCount(page: Page): Promise<number> {
  return page.evaluate(() => (window as any).__sudokuCalls__);
}

export async function gotoGameScreen(
  page: Page,
  puzzle: (number | null)[][],
  difficulty: "easy" | "medium" | "hard" = "easy",
): Promise<void> {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click(`[data-difficulty="${difficulty}"]`);
  await resolvePending(page, puzzle);
  await page.locator('[data-screen="game"]').waitFor();
}

/** Solución del planteamiento de referencia del solver. */
export const REFERENCE_SOLUTION: readonly (readonly number[])[] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

/**
 * La solución de referencia con las celdas indicadas vacías. Por defecto deja vacía
 * solo (0,2), cuyo número correcto es 4; un 5 ahí repite el 5 fijo de (0,0).
 */
export function almostSolvedPuzzle(
  empty: readonly (readonly [number, number])[] = [[0, 2]],
): (number | null)[][] {
  return REFERENCE_SOLUTION.map((row, r) =>
    row.map((value, c) => (empty.some(([er, ec]) => er === r && ec === c) ? null : value)),
  );
}
