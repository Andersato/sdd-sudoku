import { test, expect, type Page } from "@playwright/test";
import { gotoGameScreen } from "./helpers";
import {
  computed,
  containsRgb,
  contrastRatio,
  expectReducedMotion,
  paletteRgba,
  parseColor,
  sameRgb,
} from "./support/style";

// (0,0) es fija; el resto, editables vacías.
const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

const cell = (page: Page, row: number, col: number) =>
  page.locator(`[role="gridcell"][data-row="${row}"][data-col="${col}"]`);

async function writePlayerNumber(page: Page, row: number, col: number, digit: string): Promise<void> {
  await cell(page, row, col).click();
  await page.keyboard.press(digit);
  await expect(cell(page, row, col)).toHaveText(digit);
}

test.beforeEach(async ({ page }) => {
  await expectReducedMotion(page);
  await gotoGameScreen(page, PUZZLE);
});

test.describe("game-ui: el tablero distingue celdas fijas de celdas editables", () => {
  test("celdas fijas y editables se ven distintas", async ({ page }) => {
    await writePlayerNumber(page, 0, 1, "3");
    await cell(page, 4, 4).click();

    const props = ["font-weight", "color"];
    const fixed = await computed(cell(page, 0, 0), props);
    const player = await computed(cell(page, 0, 1), props);

    // Fija frente a editable vacía: difieren en el contenido.
    await expect(cell(page, 0, 0)).toHaveText("5");
    await expect(cell(page, 0, 2)).toHaveText("");
    // Fija frente a editable con número del jugador: difieren en peso y color.
    expect(fixed["font-weight"]).not.toBe(player["font-weight"]);
    expect(fixed.color).not.toBe(player.color);
  });

  test("celda fija frente a celda editable con número del jugador: 700 frente a 400", async ({ page }) => {
    await writePlayerNumber(page, 0, 1, "3");
    await cell(page, 4, 4).click();

    expect((await computed(cell(page, 0, 0), ["font-weight"]))["font-weight"]).toBe("700");
    expect((await computed(cell(page, 0, 1), ["font-weight"]))["font-weight"]).toBe("400");
  });

  test("la diferencia de grosor se mantiene al seleccionar la celda", async ({ page }) => {
    await writePlayerNumber(page, 0, 1, "3");

    await cell(page, 0, 0).click();
    expect((await computed(cell(page, 0, 0), ["font-weight"]))["font-weight"]).toBe("700");

    await cell(page, 0, 1).click();
    expect((await computed(cell(page, 0, 1), ["font-weight"]))["font-weight"]).toBe("400");
  });
});

test.describe("visual-style: colores de los números", () => {
  test("número fijo en blanco", async ({ page }) => {
    const { color } = await computed(cell(page, 0, 0), ["color"]);
    expect(sameRgb(parseColor(color), parseColor("#ffffff"))).toBe(true);
  });

  test("número del jugador en color de acento", async ({ page }) => {
    await writePlayerNumber(page, 0, 1, "3");
    await cell(page, 4, 4).click();
    const { color } = await computed(cell(page, 0, 1), ["color"]);
    expect(sameRgb(parseColor(color), await paletteRgba(page, "accent"))).toBe(true);
  });
});

test.describe("visual-style: indicador de la casilla seleccionada", () => {
  async function indicatorOf(page: Page) {
    return page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="gridcell"]')).map((el) => {
        const s = getComputedStyle(el);
        return {
          key: `${el.getAttribute("data-row")},${el.getAttribute("data-col")}`,
          outlineStyle: s.outlineStyle,
          outlineWidth: parseFloat(s.outlineWidth),
          outlineColor: s.outlineColor,
          boxShadow: s.boxShadow,
        };
      }),
    );
  }

  function hasIndicator(
    c: { outlineStyle: string; outlineWidth: number; outlineColor: string; boxShadow: string },
    accent: ReturnType<typeof parseColor>,
  ): { outline: boolean; glow: boolean } {
    return {
      outline:
        c.outlineStyle === "solid" && c.outlineWidth >= 2 && sameRgb(parseColor(c.outlineColor), accent),
      glow: c.boxShadow !== "none" && containsRgb(c.boxShadow, accent),
    };
  }

  test("celda seleccionada frente a no seleccionada", async ({ page }) => {
    const accent = await paletteRgba(page, "accent");
    await cell(page, 4, 4).click();

    const cells = await indicatorOf(page);
    for (const c of cells) {
      const { outline, glow } = hasIndicator(c, accent);
      if (c.key === "4,4") {
        expect(outline, "contorno en la seleccionada").toBe(true);
        expect(glow, "brillo en la seleccionada").toBe(true);
      } else {
        expect(outline || glow, `indicador en ${c.key}`).toBe(false);
      }
    }
    expect(cells).toHaveLength(81);
  });

  test("la celda anterior pierde el indicador", async ({ page }) => {
    const accent = await paletteRgba(page, "accent");
    await cell(page, 4, 4).click();
    await cell(page, 5, 5).click();

    const cells = await indicatorOf(page);
    const previous = hasIndicator(cells.find((c) => c.key === "4,4")!, accent);
    const current = hasIndicator(cells.find((c) => c.key === "5,5")!, accent);
    expect(previous).toEqual({ outline: false, glow: false });
    expect(current).toEqual({ outline: true, glow: true });
  });

  test("el contorno de selección tiene un contraste de al menos 3:1 con las celdas no seleccionadas", async ({
    page,
  }) => {
    await cell(page, 4, 4).click();
    const { "outline-color": outline } = await computed(cell(page, 4, 4), ["outline-color"]);
    const { "background-color": neighbour } = await computed(cell(page, 4, 5), ["background-color"]);
    expect(contrastRatio(parseColor(outline), parseColor(neighbour))).toBeGreaterThanOrEqual(3);
  });

  test("cada estado difiere de los demás en una propiedad medible que no es el color", async ({ page }) => {
    const accent = await paletteRgba(page, "accent");
    await writePlayerNumber(page, 0, 1, "3");
    await cell(page, 4, 4).click();

    const states = { fixed: [0, 0], empty: [0, 2], player: [0, 1], selected: [4, 4] } as const;
    const features: Record<string, { weight: string; indicator: boolean; content: boolean }> = {};
    const all = await indicatorOf(page);
    for (const [name, [row, col]] of Object.entries(states)) {
      const c = all.find((x) => x.key === `${row},${col}`)!;
      const { outline, glow } = hasIndicator(c, accent);
      features[name] = {
        weight: (await computed(cell(page, row, col), ["font-weight"]))["font-weight"],
        indicator: outline || glow,
        content: ((await cell(page, row, col).textContent()) ?? "") !== "",
      };
    }

    const names = Object.keys(features);
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = features[names[i]];
        const b = features[names[j]];
        const differs = a.weight !== b.weight || a.indicator !== b.indicator || a.content !== b.content;
        expect(differs, `${names[i]} frente a ${names[j]}`).toBe(true);
      }
    }
  });
});

test("pasar el ratón por una celda no cambia su aspecto", async ({ page }) => {
  const props = ["background-color", "color", "outline-style", "outline-color", "box-shadow"];
  const target = cell(page, 3, 3);
  const before = await computed(target, props);
  await target.hover();
  expect(await computed(target, props)).toEqual(before);
});

test.describe("visual-style: números en error", () => {
  const isUnderlined = async (row: number, col: number, page: Page) =>
    (await computed(cell(page, row, col), ["text-decoration-line"]))["text-decoration-line"].includes("underline");

  async function colorOf(page: Page, row: number, col: number) {
    return parseColor((await computed(cell(page, row, col), ["color"])).color);
  }

  test("número en error en el color de error (fijo y del jugador, seleccionado o no)", async ({ page }) => {
    const error = await paletteRgba(page, "error");
    // El 5 en (0,4) repite el 5 fijo de (0,0).
    await writePlayerNumber(page, 0, 4, "5");

    // Del jugador, seleccionada.
    expect(sameRgb(await colorOf(page, 0, 4), error)).toBe(true);
    // Fija, seleccionada.
    await cell(page, 0, 0).click();
    expect(sameRgb(await colorOf(page, 0, 0), error)).toBe(true);
    // Las dos sin seleccionar.
    await cell(page, 4, 4).click();
    expect(sameRgb(await colorOf(page, 0, 0), error)).toBe(true);
    expect(sameRgb(await colorOf(page, 0, 4), error)).toBe(true);
  });

  test("el número recupera su color al resolverse el conflicto", async ({ page }) => {
    const accent = await paletteRgba(page, "accent");
    await writePlayerNumber(page, 0, 4, "5");
    await writePlayerNumber(page, 0, 4, "3");
    await cell(page, 4, 4).click();

    expect(sameRgb(await colorOf(page, 0, 4), accent)).toBe(true);
    expect(sameRgb(await colorOf(page, 0, 0), parseColor("#ffffff"))).toBe(true);
  });

  test("una celda en error se distingue sin depender del color", async ({ page }) => {
    // Fijas: 5 en (0,0) y 2 en (8,8). El jugador pone 5 en (0,4) (conflicto con (0,0))
    // y 3 en (6,6), sin conflicto.
    const puzzle: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) => {
        if (row === 0 && col === 0) return 5;
        if (row === 8 && col === 8) return 2;
        return null;
      }),
    );
    await gotoGameScreen(page, puzzle);
    await writePlayerNumber(page, 0, 4, "5");
    await writePlayerNumber(page, 6, 6, "3");
    await cell(page, 4, 4).click();

    // Jugador en error frente a jugador sin marcar.
    expect(await isUnderlined(0, 4, page)).toBe(true);
    expect(await isUnderlined(6, 6, page)).toBe(false);
    // Fija en error frente a fija sin marcar.
    expect(await isUnderlined(0, 0, page)).toBe(true);
    expect(await isUnderlined(8, 8, page)).toBe(false);
  });
});
