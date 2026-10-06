import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoGameScreen, installPuzzleHook, rejectPending } from "./helpers";
import {
  computed,
  contrastRatio,
  expectReducedMotion,
  paletteRgba,
  parseColor,
  sameRgb,
  tabThroughButtons,
  type Rgba,
} from "./support/style";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

const LOOK = [
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "color",
  "box-shadow",
  "transform",
  "outline-style",
];

const look = (locator: Locator) => computed(locator, LOOK);

async function goToErrorScreen(page: Page): Promise<void> {
  await installPuzzleHook(page);
  await page.goto("/");
  await page.click('[data-difficulty="easy"]');
  await rejectPending(page, "fallo de prueba");
  await expect(page.getByRole("alert")).toBeVisible();
}

function usesColor(style: Record<string, string>, color: Rgba): boolean {
  return [
    "background-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "color",
  ].some((p) => sameRgb(parseColor(style[p]), color));
}

/** Mide el aspecto con el botón pulsado y lo suelta sin mover el ratón. */
async function pressedLook(page: Page, button: Locator): Promise<Record<string, string>> {
  await button.hover();
  await page.mouse.down();
  const style = await look(button);
  await page.mouse.up();
  return style;
}

test.beforeEach(async ({ page }) => {
  await expectReducedMotion(page);
});

test.describe("tipos de botón (data-variant)", () => {
  test("pantalla inicial: las dificultades son principales", async ({ page }) => {
    await page.goto("/");
    for (const d of ["easy", "medium", "hard"]) {
      await expect(page.locator(`[data-difficulty="${d}"]`)).toHaveAttribute("data-variant", "primary");
    }
  });

  test("pantalla de error: Reintentar y las dificultades son principales", async ({ page }) => {
    await goToErrorScreen(page);
    await expect(page.getByRole("button", { name: "Reintentar" })).toHaveAttribute("data-variant", "primary");
    for (const d of ["easy", "medium", "hard"]) {
      await expect(page.locator(`[data-difficulty="${d}"]`)).toHaveAttribute("data-variant", "primary");
    }
  });

  test("pantalla de juego: números principales; Borrar y Nueva partida secundarios", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    for (let d = 1; d <= 9; d++) {
      await expect(page.locator(`[data-digit="${d}"]`)).toHaveAttribute("data-variant", "primary");
    }
    await expect(page.locator('[data-action="erase"]')).toHaveAttribute("data-variant", "secondary");
    await expect(page.getByRole("button", { name: "Nueva partida" })).toHaveAttribute(
      "data-variant",
      "secondary",
    );
    expect(await page.locator("button:not([data-variant])").count()).toBe(0);
  });
});

test.describe("jerarquía y forma de los botones", () => {
  test("los principales habilitados tienen fondo de acento en todas las pantallas", async ({ page }) => {
    await page.goto("/");
    const accent = await paletteRgba(page, "accent");
    const expectAccent = async (locator: Locator) => {
      await page.mouse.move(0, 0);
      const { "background-color": bg } = await computed(locator, ["background-color"]);
      expect(sameRgb(parseColor(bg), accent)).toBe(true);
    };

    for (const d of ["easy", "medium", "hard"]) await expectAccent(page.locator(`[data-difficulty="${d}"]`));

    await goToErrorScreen(page);
    await expectAccent(page.getByRole("button", { name: "Reintentar" }));
    for (const d of ["easy", "medium", "hard"]) await expectAccent(page.locator(`[data-difficulty="${d}"]`));

    await gotoGameScreen(page, PUZZLE);
    for (let d = 1; d <= 9; d++) await expectAccent(page.locator(`[data-digit="${d}"]`));
  });

  test("los secundarios no usan el acento en reposo, con el ratón encima ni pulsados", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    const accent = await paletteRgba(page, "accent");
    const erase = page.locator('[data-action="erase"]');
    const newGame = page.getByRole("button", { name: "Nueva partida" });

    await page.mouse.move(0, 0);
    expect(usesColor(await look(erase), accent)).toBe(false);
    expect(usesColor(await look(newGame), accent)).toBe(false);

    await newGame.hover();
    expect(usesColor(await look(newGame), accent)).toBe(false);
    await erase.hover();
    expect(usesColor(await look(erase), accent)).toBe(false);
    // Sin celda seleccionada, pulsar Borrar no cambia nada (D8).
    expect(usesColor(await pressedLook(page, erase), accent)).toBe(false);
  });

  test("los botones desactivados no usan el acento", async ({ page }) => {
    await installPuzzleHook(page);
    await page.goto("/");
    const accent = await paletteRgba(page, "accent");
    await page.click('[data-difficulty="easy"]');
    for (const d of ["easy", "medium", "hard"]) {
      const button = page.locator(`[data-difficulty="${d}"]`);
      await expect(button).toBeDisabled();
      expect(usesColor(await look(button), accent)).toBe(false);
    }
  });

  test("el borde o el fondo de cada botón habilitado tiene al menos 3:1 sobre el fondo", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    const bg = await paletteRgba(page, "bg");
    const limit = (style: Record<string, string>) =>
      Math.max(
        contrastRatio(parseColor(style["background-color"]), bg),
        contrastRatio(parseColor(style["border-top-color"]), bg),
      );

    for (const button of await page.locator("button").all()) {
      await page.mouse.move(0, 0);
      expect(limit(await look(button))).toBeGreaterThanOrEqual(3);
      await button.hover();
      expect(limit(await look(button))).toBeGreaterThanOrEqual(3);
    }
  });

  // Escenario: "Límite del botón visible", en las pantallas inicial y de error.
  for (const screen of ["inicial", "de error"] as const) {
    test(`pantalla ${screen}: el borde o el fondo de cada botón habilitado tiene al menos 3:1`, async ({
      page,
    }) => {
      if (screen === "inicial") await page.goto("/");
      else await goToErrorScreen(page);
      const bg = await paletteRgba(page, "bg");
      const limit = (style: Record<string, string>) =>
        Math.max(
          contrastRatio(parseColor(style["background-color"]), bg),
          contrastRatio(parseColor(style["border-top-color"]), bg),
        );
      const buttons = await page.locator("button:not(:disabled)").all();
      expect(buttons.length).toBeGreaterThan(0);
      for (const button of buttons) {
        await page.mouse.move(0, 0);
        expect(limit(await look(button))).toBeGreaterThanOrEqual(3);
        await button.hover();
        expect(limit(await look(button))).toBeGreaterThanOrEqual(3);
      }
    });
  }

  test("los botones habilitados tienen esquinas redondeadas y sombra", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    for (const button of await page.locator("button").all()) {
      const style = await computed(button, ["border-top-left-radius", "box-shadow"]);
      expect(parseFloat(style["border-top-left-radius"])).toBeGreaterThan(0);
      expect(style["box-shadow"]).not.toBe("none");
    }
  });
});

test.describe("respuesta visual de los botones", () => {
  // Botones cuyo clic no cambia nada sin celda seleccionada (D8).
  const cases = [
    { name: "principal (5)", selector: '[data-digit="5"]' },
    { name: "secundario (Borrar)", selector: '[data-action="erase"]' },
  ];

  for (const { name, selector } of cases) {
    test(`${name}: reposo, ratón encima, pulsado y vuelta atrás`, async ({ page }) => {
      await gotoGameScreen(page, PUZZLE);
      const button = page.locator(selector);

      await page.mouse.move(0, 0);
      const rest = await look(button);

      await button.hover();
      const hover = await look(button);
      expect(hover).not.toEqual(rest);

      await page.mouse.down();
      const pressed = await look(button);
      expect(pressed).not.toEqual(hover);

      await page.mouse.up();
      const afterRelease = await look(button);
      expect(afterRelease["background-color"]).toBe(hover["background-color"]);
      expect(afterRelease["box-shadow"]).toBe(hover["box-shadow"]);
      expect(afterRelease.transform).toBe(hover.transform);

      await page.mouse.move(0, 0);
      const back = await look(button);
      expect(back["background-color"]).toBe(rest["background-color"]);
      expect(back["box-shadow"]).toBe(rest["box-shadow"]);
      expect(back.transform).toBe(rest.transform);

      // El tablero no ha cambiado: el clic no tenía efecto.
      await expect(page.locator('[data-row="0"][data-col="1"]')).toHaveText("");
    });
  }

  test("un botón que recibe el foco con Tab muestra un indicador de al menos 3:1", async ({ page }) => {
    await gotoGameScreen(page, PUZZLE);
    const button = page.locator('[data-digit="1"]');
    const rest = await computed(button, ["outline-style"]);
    expect(rest["outline-style"]).toBe("none");

    await page.keyboard.press("Tab");
    await expect(button).toBeFocused();
    const focused = await computed(button, ["outline-style", "outline-color"]);
    expect(focused["outline-style"]).toBe("solid");
    const bg = await paletteRgba(page, "bg");
    expect(contrastRatio(parseColor(focused["outline-color"]), bg)).toBeGreaterThanOrEqual(3);
  });

  // Escenarios: "Foco del teclado visible en los botones" e "Indicador de foco visible",
  // con foco de teclado real (Tab y :focus-visible) en todos los botones de cada pantalla.
  for (const screen of ["inicial", "de error", "de juego"] as const) {
    test(`pantalla ${screen}: cada botón muestra con Tab un indicador de foco que no tiene en reposo`, async ({
      page,
    }) => {
      if (screen === "inicial") await page.goto("/");
      else if (screen === "de error") await goToErrorScreen(page);
      else await gotoGameScreen(page, PUZZLE);
      await page.mouse.move(0, 0);
      const bg = await paletteRgba(page, "bg");
      const indicator = ["outline-style", "outline-width", "outline-color"];

      const buttons = await page.locator("button:not(:disabled)").all();
      const rest: Record<string, string>[] = [];
      for (const button of buttons) {
        await button.evaluate((el) => (el as HTMLElement).blur());
        rest.push(await computed(button, indicator));
      }

      await tabThroughButtons(page, async (focused, index) => {
        const style = await computed(focused, indicator);
        expect(rest[index]["outline-style"], `botón ${index} en reposo`).toBe("none");
        expect(style["outline-style"], `botón ${index} con foco`).toBe("solid");
        expect(parseFloat(style["outline-width"])).toBeGreaterThan(0);
        expect(contrastRatio(parseColor(style["outline-color"]), bg)).toBeGreaterThanOrEqual(3);
      });
    });
  }

  test("un botón desactivado se ve distinto y no reacciona al ratón", async ({ page }) => {
    await installPuzzleHook(page);
    await page.goto("/");
    const button = page.locator('[data-difficulty="medium"]');
    await page.mouse.move(0, 0);
    const enabled = await look(button);

    await page.click('[data-difficulty="easy"]');
    await expect(button).toBeDisabled();
    await page.mouse.move(0, 0);
    const disabled = await look(button);
    expect(disabled["background-color"]).not.toBe(enabled["background-color"]);

    await button.hover({ force: true });
    expect(await look(button)).toEqual(disabled);
  });
});
