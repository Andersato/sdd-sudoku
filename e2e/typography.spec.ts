import { test, expect } from "@playwright/test";
import { gotoGameScreen } from "./helpers";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

test("no se descarga ninguna fuente al cargar y jugar", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() === "font") {
      fontRequests.push(request.url());
    }
  });

  await gotoGameScreen(page, PUZZLE);
  await page.click('[data-row="0"][data-col="1"]');
  await page.keyboard.press("3");
  await expect(page.locator('[data-row="0"][data-col="1"]')).toHaveText("3");

  expect(fontRequests).toEqual([]);
});

test("las hojas de estilo no declaran fuentes propias", async ({ page }) => {
  await gotoGameScreen(page, PUZZLE);
  const fontFaceRules = await page.evaluate(() => {
    let count = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) {
          count++;
        }
      }
    }
    return count;
  });
  expect(fontFaceRules).toBe(0);
});
