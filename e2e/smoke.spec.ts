import { test, expect } from "@playwright/test";

test("blank page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("SDD Sudoku");
});
