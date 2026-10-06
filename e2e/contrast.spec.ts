import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoGameScreen, installPuzzleHook, rejectPending } from "./helpers";
import {
  expectReducedMotion,
  paletteRgba,
  parseColor,
  sameRgb,
  tabThroughButtons,
  textContrast,
  type Rgba,
} from "./support/style";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

const AA_TEXT = 4.5;

const cell = (page: Page, row: number, col: number) =>
  page.locator(`[role="gridcell"][data-row="${row}"][data-col="${col}"]`);

async function goToErrorScreen(page: Page): Promise<void> {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, "No se pudo generar el sudoku. Inténtalo de nuevo.");
  await expect(page.getByRole("alert")).toBeVisible();
}

async function expectLegible(locator: Locator, minimum = AA_TEXT): Promise<void> {
  expect(await textContrast(locator)).toBeGreaterThanOrEqual(minimum);
}

test.beforeEach(async ({ page }) => {
  await expectReducedMotion(page);
});

test.describe("contraste del texto en el tablero", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    await cell(page, 0, 1).click();
    await page.keyboard.press("3");
    await expect(cell(page, 0, 1)).toHaveText("3");
  });

  test("número fijo y número del jugador sin seleccionar", async ({ page }) => {
    await cell(page, 4, 4).click();
    await expectLegible(cell(page, 0, 0));
    await expectLegible(cell(page, 0, 1));
  });

  test("número del jugador dentro de la casilla seleccionada", async ({ page }) => {
    await cell(page, 0, 1).click();
    await expect(cell(page, 0, 1)).toHaveAttribute("aria-selected", "true");
    await expectLegible(cell(page, 0, 1));
  });

  test("número fijo dentro de la casilla seleccionada", async ({ page }) => {
    await cell(page, 0, 0).click();
    await expect(cell(page, 0, 0)).toHaveAttribute("aria-selected", "true");
    await expectLegible(cell(page, 0, 0));
  });
});

test.describe("contraste del texto fuera del tablero", () => {
  test("título", async ({ page }) => {
    await page.goto("/");
    await expectLegible(page.getByRole("heading", { name: "SDD Sudoku" }));
  });

  test("aviso de generación", async ({ page }) => {
    await installPuzzleHook(page);
    await page.goto("/");
    await page.click('[data-difficulty="easy"]');
    await expectLegible(page.getByRole("status"));
  });

  test("mensaje de error de generación", async ({ page }) => {
    await goToErrorScreen(page);
    await expectLegible(page.getByRole("alert"));
  });
});

test.describe("contraste del texto de los botones", () => {
  async function restAndHover(page: Page, buttons: Locator[]): Promise<void> {
    for (const button of buttons) {
      await page.mouse.move(0, 0);
      await expectLegible(button);
      await button.hover();
      await expectLegible(button);
    }
    await page.mouse.move(0, 0);
  }

  /** Foco del teclado real: Tab hasta cada botón, con :focus-visible comprobado. */
  async function keyboardFocus(page: Page): Promise<void> {
    await page.mouse.move(0, 0);
    await tabThroughButtons(page, async (focused) => {
      await expectLegible(focused);
    });
  }

  async function pressedWithoutRelease(page: Page, button: Locator): Promise<number> {
    await button.hover();
    await page.mouse.down();
    const ratio = await textContrast(button);
    return ratio;
  }

  test("pantalla inicial: reposo, ratón encima y foco del teclado (Tab)", async ({ page }) => {
    await page.goto("/");
    await restAndHover(page, await page.locator("button").all());
    await keyboardFocus(page);
  });

  test("pantalla de error: reposo, ratón encima y foco del teclado (Tab)", async ({ page }) => {
    await goToErrorScreen(page);
    await restAndHover(page, await page.locator("button").all());
    await keyboardFocus(page);
  });

  test("pantalla de juego: reposo, ratón encima y foco del teclado (Tab)", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    await restAndHover(page, await page.locator("button").all());
    await keyboardFocus(page);
  });

  test("pulsados: el 5 y Borrar sin celda seleccionada", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    for (const selector of ['[data-digit="5"]', '[data-action="erase"]']) {
      const button = page.locator(selector);
      expect(await pressedWithoutRelease(page, button)).toBeGreaterThanOrEqual(AA_TEXT);
      await page.mouse.up();
    }
  });

  test("pulsado: un botón de dificultad, sin soltarlo", async ({ page }) => {
    await page.goto("/");
    const button = page.locator('[data-difficulty="medium"]');
    expect(await pressedWithoutRelease(page, button)).toBeGreaterThanOrEqual(AA_TEXT);
    // No se suelta: soltar haría un clic e iniciaría la generación.
  });

  test("pulsado: Reintentar, sin soltarlo", async ({ page }) => {
    await goToErrorScreen(page);
    const button = page.getByRole("button", { name: "Reintentar" });
    expect(await pressedWithoutRelease(page, button)).toBeGreaterThanOrEqual(AA_TEXT);
    // No se suelta: soltar relanzaría la generación.
  });

  test("pulsado: Nueva partida, sin soltarlo", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    const button = page.getByRole("button", { name: "Nueva partida" });
    expect(await pressedWithoutRelease(page, button)).toBeGreaterThanOrEqual(AA_TEXT);
    // No se suelta: soltar volvería a la pantalla inicial.
  });

  test("botones desactivados: al menos 3:1", async ({ page }) => {
    await installPuzzleHook(page);
    await page.goto("/");
    await page.click('[data-difficulty="easy"]');
    for (const d of ["easy", "medium", "hard"]) {
      const button = page.locator(`[data-difficulty="${d}"]`);
      await expect(button).toBeDisabled();
      await expectLegible(button, 3);
    }
  });
});

/**
 * Recorre html, body, todos los elementos visibles y sus ::before/::after, y devuelve
 * dónde aparece alguno de los colores reservados en texto, fondo, borde o contorno.
 */
async function reservedColorUses(page: Page, reserved: Rgba[]): Promise<string[]> {
  const values = await page.evaluate(() => {
    const props = [
      "color",
      "background-color",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
    ];
    const isVisible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    };
    const elements = [document.documentElement, document.body, ...Array.from(document.querySelectorAll("body *"))];
    const out: { where: string; prop: string; value: string }[] = [];
    for (const el of elements.filter(isVisible)) {
      const label = `<${el.tagName.toLowerCase()}${el.getAttribute("data-row") !== null ? ` ${el.getAttribute("data-row")},${el.getAttribute("data-col")}` : ""}>${el.textContent?.slice(0, 15) ?? ""}`;
      for (const pseudo of [null, "::before", "::after"] as const) {
        const s = getComputedStyle(el, pseudo);
        if (pseudo !== null && (s.content === "none" || s.content === "normal")) continue;
        for (const p of props) out.push({ where: `${label}${pseudo ?? ""}`, prop: p, value: s.getPropertyValue(p) });
      }
    }
    return out;
  });
  if (values.length === 0) throw new Error("No se ha recorrido ningún elemento");
  return values
    .filter(({ value }) => reserved.some((c) => sameRgb(parseColor(value), c)))
    .map(({ where, prop, value }) => `${where} ${prop}=${value}`);
}

// Escenario: "Los colores reservados no aparecen todavía en pantalla".
test("los colores reservados no aparecen en ninguna pantalla", async ({ page }) => {
  await installPuzzleHook(page);
  await page.goto("/");
  const reserved = [await paletteRgba(page, "error"), await paletteRgba(page, "success")];

  /** Reposo, ratón encima de cada botón y foco del teclado en cada botón. */
  const check = async (screen: string) => {
    await page.mouse.move(0, 0);
    expect(await reservedColorUses(page, reserved), `${screen}: reposo`).toEqual([]);
    for (const button of await page.locator("button:not(:disabled)").all()) {
      await button.hover();
      expect(await reservedColorUses(page, reserved), `${screen}: ratón encima`).toEqual([]);
    }
    await page.mouse.move(0, 0);
    await tabThroughButtons(page, async () => {
      expect(await reservedColorUses(page, reserved), `${screen}: foco del teclado`).toEqual([]);
    });
  };

  await check("inicial");

  await page.click('[data-difficulty="easy"]');
  await expect(page.getByRole("status")).toBeVisible();
  await check("generando");

  await rejectPending(page, "fallo de prueba");
  await expect(page.getByRole("alert")).toBeVisible();
  await check("error");

  await gotoGameScreen(page, PUZZLE);
  await cell(page, 0, 1).click();
  await page.keyboard.press("3");
  await expect(cell(page, 0, 1)).toHaveText("3");
  await cell(page, 4, 4).click();
  await check("juego");

  // Pulsados sin efecto (D8): el 5 y Borrar sin celda editable seleccionada.
  await cell(page, 0, 0).click();
  for (const selector of ['[data-digit="5"]', '[data-action="erase"]']) {
    await page.locator(selector).hover();
    await page.mouse.down();
    expect(await reservedColorUses(page, reserved), `juego: ${selector} pulsado`).toEqual([]);
    await page.mouse.up();
  }

  // Foco del teclado en el tablero.
  await page.locator('[data-digit="1"]').focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("grid")).toBeFocused();
  expect(await reservedColorUses(page, reserved), "juego: foco del tablero").toEqual([]);
});
