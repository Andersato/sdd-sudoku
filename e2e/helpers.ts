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
