import { test, expect, type Locator, type Page } from "@playwright/test";
import { almostSolvedPuzzle, gotoGameScreen, installPuzzleHook, resolvePending } from "./helpers";
import { computed, containsRgb, paletteRgba, parseColor, sameRgb } from "./support/style";

// (0,0) = 5 y (4,8) = 7 son fijas; el resto, editables vacías.
const SPARSE_PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => {
    if (row === 0 && col === 0) return 5;
    if (row === 4 && col === 8) return 7;
    return null;
  }),
);

const cell = (page: Page, row: number, col: number) =>
  page.locator(`[role="gridcell"][data-row="${row}"][data-col="${col}"]`);

async function write(page: Page, row: number, col: number, digit: string): Promise<void> {
  await cell(page, row, col).click();
  await page.keyboard.press(digit);
  await expect(cell(page, row, col)).toHaveText(digit);
}

async function erase(page: Page, row: number, col: number): Promise<void> {
  await cell(page, row, col).click();
  await page.keyboard.press("Backspace");
  await expect(cell(page, row, col)).toHaveText("");
}

/** Marca de error: número en el color de error y subrayado. */
async function isMarked(locator: Locator): Promise<boolean> {
  const style = await computed(locator, ["color", "text-decoration-line"]);
  const error = await paletteRgba(locator.page(), "error");
  return sameRgb(parseColor(style.color), error) && style["text-decoration-line"].includes("underline");
}

/** Coordenadas "fila,columna" de todas las celdas que muestran la marca de error. */
async function markedCells(page: Page): Promise<string[]> {
  const error = await paletteRgba(page, "error");
  const styles = await page.locator('[role="gridcell"]').evaluateAll((cells) =>
    cells.map((el) => {
      const style = getComputedStyle(el);
      return {
        key: `${el.getAttribute("data-row")},${el.getAttribute("data-col")}`,
        color: style.color,
        decoration: style.textDecorationLine,
      };
    }),
  );
  expect(styles).toHaveLength(81);
  return styles
    .filter((s) => sameRgb(parseColor(s.color), error) || s.decoration.includes("underline"))
    .map((s) => s.key)
    .sort();
}

test.describe("game-feedback: marca de error en las casillas en conflicto", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGameScreen(page, SPARSE_PUZZLE);
  });

  test("dos números del jugador repetidos en una fila", async ({ page }) => {
    await write(page, 2, 1, "3");
    await write(page, 2, 7, "3");
    expect(await isMarked(cell(page, 2, 1))).toBe(true);
    expect(await isMarked(cell(page, 2, 7))).toBe(true);
  });

  test("número del jugador repetido con una casilla fija de su columna", async ({ page }) => {
    await write(page, 6, 0, "5");
    expect(await isMarked(cell(page, 6, 0))).toBe(true);
    expect(await isMarked(cell(page, 0, 0))).toBe(true);
  });

  test("número del jugador repetido en su cuadro 3x3", async ({ page }) => {
    await write(page, 3, 3, "8");
    await write(page, 4, 4, "8");
    expect(await isMarked(cell(page, 3, 3))).toBe(true);
    expect(await isMarked(cell(page, 4, 4))).toBe(true);
  });

  test("solo se marcan las casillas en conflicto: (0,0) y (0,4)", async ({ page }) => {
    await write(page, 0, 4, "5");
    expect(await markedCells(page)).toEqual(["0,0", "0,4"]);
  });

  test("un número sin conflicto no se marca", async ({ page }) => {
    await write(page, 8, 8, "9");
    expect(await isMarked(cell(page, 8, 8))).toBe(false);
    expect(await markedCells(page)).toEqual([]);
  });

  test("las casillas marcadas conservan su grosor (700 fija, 400 jugador)", async ({ page }) => {
    await write(page, 0, 4, "5");
    await cell(page, 8, 8).click();
    expect(await isMarked(cell(page, 0, 0))).toBe(true);
    expect(await isMarked(cell(page, 0, 4))).toBe(true);
    expect((await computed(cell(page, 0, 0), ["font-weight"]))["font-weight"]).toBe("700");
    expect((await computed(cell(page, 0, 4), ["font-weight"]))["font-weight"]).toBe("400");
  });
});

test.describe("game-feedback: actualización inmediata de las marcas de error", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGameScreen(page, SPARSE_PUZZLE);
  });

  test("la marca desaparece al borrar uno de los números repetidos", async ({ page }) => {
    await write(page, 2, 1, "3");
    await write(page, 2, 7, "3");
    await erase(page, 2, 7);
    expect(await markedCells(page)).toEqual([]);
  });

  test("la marca desaparece al reemplazar el número repetido", async ({ page }) => {
    await write(page, 2, 1, "3");
    await write(page, 2, 7, "3");
    await write(page, 2, 7, "4");
    expect(await markedCells(page)).toEqual([]);
  });

  test("una casilla en varios conflictos sigue marcada mientras quede alguno", async ({ page }) => {
    await write(page, 0, 4, "5");
    await write(page, 4, 0, "5");
    expect(await markedCells(page)).toEqual(["0,0", "0,4", "4,0"]);

    await erase(page, 0, 4);
    expect(await markedCells(page)).toEqual(["0,0", "4,0"]);
    await expect(cell(page, 0, 4)).toHaveText("");
  });

  test("casilla seleccionada en conflicto: marca e indicador de selección a la vez", async ({ page }) => {
    await write(page, 0, 4, "5");
    const selected = cell(page, 0, 4);
    await expect(selected).toHaveAttribute("aria-selected", "true");
    expect(await isMarked(selected)).toBe(true);

    const accent = await paletteRgba(page, "accent");
    const style = await computed(selected, ["outline-style", "outline-width", "outline-color", "box-shadow"]);
    expect(style["outline-style"]).toBe("solid");
    expect(parseFloat(style["outline-width"])).toBeGreaterThanOrEqual(2);
    expect(sameRgb(parseColor(style["outline-color"]), accent)).toBe(true);
    expect(containsRgb(style["box-shadow"], accent)).toBe(true);
  });
});

const completeMessage = (page: Page) => page.getByTestId("game-complete");

test.describe("game-feedback: detección y aviso de partida completada", () => {
  test("el último número correcto completa la partida", async ({ page }) => {
    await gotoGameScreen(page, almostSolvedPuzzle());
    await expect(completeMessage(page)).toHaveCount(0);
    await write(page, 0, 2, "4");

    const message = completeMessage(page);
    await expect(message).toBeVisible();
    const lines = message.locator("p");
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveText("¡Sudoku resuelto!");
    await expect(lines.nth(1)).toHaveText(/^Tiempo: \d{2}:\d{2}$/);

    const success = await paletteRgba(page, "success");
    for (const target of [message, lines.nth(0), lines.nth(1)]) {
      const { color } = await computed(target, ["color"]);
      expect(sameRgb(parseColor(color), success)).toBe(true);
    }
  });

  test("tablero lleno con conflictos no se considera completado", async ({ page }) => {
    await startTimedGame(page, almostSolvedPuzzle());
    await page.clock.fastForward(10_000);
    await write(page, 0, 2, "5");
    await expect(completeMessage(page)).toHaveCount(0);
    expect(await isMarked(cell(page, 0, 2))).toBe(true);
    expect(await isMarked(cell(page, 0, 0))).toBe(true);

    // El temporizador sigue contando.
    await page.clock.fastForward(5_000);
    await expect(timerDisplay(page)).toHaveText("00:15");
  });

  test("corregir un conflicto con el tablero lleno completa la partida", async ({ page }) => {
    await gotoGameScreen(page, almostSolvedPuzzle());
    await write(page, 0, 2, "5");
    await expect(completeMessage(page)).toHaveCount(0);
    await write(page, 0, 2, "4");
    await expect(completeMessage(page)).toBeVisible();
    expect(await markedCells(page)).toEqual([]);
  });

  test("partida sin completar no muestra el mensaje", async ({ page }) => {
    await gotoGameScreen(page, almostSolvedPuzzle([[0, 2], [8, 8]]));
    await write(page, 0, 2, "4");
    await expect(cell(page, 8, 8)).toHaveText("");
    await expect(completeMessage(page)).toHaveCount(0);
  });
});

test.describe("game-feedback: tablero bloqueado tras completar la partida", () => {
  test.beforeEach(async ({ page }) => {
    await gotoGameScreen(page, almostSolvedPuzzle());
    await write(page, 0, 2, "4");
    await expect(completeMessage(page)).toBeVisible();
  });

  test("escribir tras completar no cambia nada (tecla y botón)", async ({ page }) => {
    await cell(page, 0, 2).click();
    await page.keyboard.press("7");
    await expect(cell(page, 0, 2)).toHaveText("4");
    await page.locator('[data-digit="7"]').click();
    await expect(cell(page, 0, 2)).toHaveText("4");
    await expect(completeMessage(page)).toBeVisible();
  });

  test("borrar tras completar no cambia nada (Backspace, Delete y botón)", async ({ page }) => {
    await cell(page, 0, 2).click();
    await page.keyboard.press("Backspace");
    await expect(cell(page, 0, 2)).toHaveText("4");
    await page.keyboard.press("Delete");
    await expect(cell(page, 0, 2)).toHaveText("4");
    await page.locator('[data-action="erase"]').click();
    await expect(cell(page, 0, 2)).toHaveText("4");
    await expect(completeMessage(page)).toBeVisible();
  });

  test("la selección sigue funcionando tras completar", async ({ page }) => {
    await cell(page, 5, 5).click();
    await expect(cell(page, 5, 5)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(cell(page, 5, 6)).toHaveAttribute("aria-selected", "true");
    await expect(cell(page, 5, 5)).toHaveAttribute("aria-selected", "false");
  });
});

// Temporizador: patrón de reloj de design.md D7. El reloj se instala antes de cargar la
// página y se para antes de que aparezca el tablero; el tiempo solo avanza con fastForward,
// que salta el tiempo y dispara una vez el intervalo del temporizador (runFor lo dispararía
// cada 250 ms y sería muy lento en saltos de horas).
const CLOCK_START = new Date("2026-01-01T10:00:00Z");
const timerDisplay = (page: Page) => page.getByTestId("timer");

async function setPageHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((h) => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (h ? "hidden" : "visible"),
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}

async function startTimedGame(
  page: Page,
  puzzle: (number | null)[][],
  options: { hidden?: boolean } = {},
): Promise<void> {
  await installPuzzleHook(page);
  await page.clock.install({ time: CLOCK_START });
  await page.goto("/");
  // Margen amplio: pauseAt falla si la carga de la página ya ha superado ese instante.
  await page.clock.pauseAt(new Date(CLOCK_START.getTime() + 60_000));
  await page.click('[data-difficulty="easy"]');
  if (options.hidden) {
    await setPageHidden(page, true);
  }
  await resolvePending(page, puzzle);
  await page.locator('[data-screen="game"]').waitFor();
}

test.describe("game-feedback: temporizador de la partida", () => {
  test("el temporizador empieza a cero", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await expect(timerDisplay(page)).toHaveText("00:00");
  });

  test("formato por debajo de una hora: 75 s → 01:15", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await page.clock.fastForward(75_000);
    await expect(timerDisplay(page)).toHaveText("01:15");
  });

  test("formato a partir de una hora: 3725 s → 1:02:05", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await page.clock.fastForward(3_725_000);
    await expect(timerDisplay(page)).toHaveText("1:02:05");
  });

  test("sigue contando con la partida sin completar", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await page.clock.fastForward(10_000);
    await expect(timerDisplay(page)).toHaveText("00:10");
    await write(page, 3, 3, "3");
    await erase(page, 3, 3);
    await page.clock.fastForward(5_000);
    await expect(timerDisplay(page)).toHaveText("00:15");
  });
});

test.describe("game-feedback: pausa del temporizador con la página no visible", () => {
  test("el tiempo oculto no cuenta", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await page.clock.fastForward(40_000);
    await expect(timerDisplay(page)).toHaveText("00:40");

    await setPageHidden(page, true);
    await page.clock.fastForward(30_000);
    await setPageHidden(page, false);
    await page.clock.fastForward(250);
    await expect(timerDisplay(page)).toHaveText("00:40");

    await page.clock.fastForward(1_000);
    await expect(timerDisplay(page)).toHaveText("00:41");
  });

  test("tablero mostrado con la página oculta", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE, { hidden: true });
    await page.clock.fastForward(20_000);
    await setPageHidden(page, false);
    await page.clock.fastForward(250);
    await expect(timerDisplay(page)).toHaveText("00:00");

    await page.clock.fastForward(1_000);
    await expect(timerDisplay(page)).toHaveText("00:01");
  });

  test("perder el foco sin ocultarse no pausa el temporizador", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await page.clock.fastForward(40_000);
    await expect(timerDisplay(page)).toHaveText("00:40");

    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await page.clock.fastForward(30_000);
    await expect(timerDisplay(page)).toHaveText("01:10");
  });

  test("ocultar la página con la partida completada no cambia nada", async ({ page }) => {
    await startTimedGame(page, almostSolvedPuzzle());
    await page.clock.fastForward(65_000);
    await write(page, 0, 2, "4");
    await expect(timerDisplay(page)).toHaveText("01:05");
    await expect(completeMessage(page).locator("p").nth(1)).toHaveText("Tiempo: 01:05");

    await setPageHidden(page, true);
    await page.clock.fastForward(30_000);
    await setPageHidden(page, false);
    await page.clock.fastForward(5_000);
    await expect(timerDisplay(page)).toHaveText("01:05");
    await expect(completeMessage(page).locator("p").nth(1)).toHaveText("Tiempo: 01:05");
  });
});

test.describe("game-feedback: detención y reinicio del temporizador", () => {
  test("el temporizador se detiene al completar", async ({ page }) => {
    await startTimedGame(page, almostSolvedPuzzle());
    await page.clock.fastForward(754_000);
    await write(page, 0, 2, "4");
    await page.clock.fastForward(10_000);
    await expect(timerDisplay(page)).toHaveText("12:34");
    await expect(completeMessage(page).locator("p").nth(1)).toHaveText("Tiempo: 12:34");
  });

  test("el mensaje muestra el tiempo final concreto en dos líneas", async ({ page }) => {
    await startTimedGame(page, almostSolvedPuzzle());
    await page.clock.fastForward(187_000);
    await write(page, 0, 2, "4");
    const lines = completeMessage(page).locator("p");
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveText("¡Sudoku resuelto!");
    await expect(lines.nth(1)).toHaveText("Tiempo: 03:07");
  });

  test("una partida nueva empieza a cero", async ({ page }) => {
    await startTimedGame(page, almostSolvedPuzzle());
    await page.clock.fastForward(30_000);
    await write(page, 0, 2, "4");
    await expect(completeMessage(page)).toBeVisible();

    await page.click('button:has-text("Nueva partida")');
    await page.click('[data-difficulty="easy"]');
    await resolvePending(page, SPARSE_PUZZLE);
    await page.locator('[data-screen="game"]').waitFor();
    await expect(timerDisplay(page)).toHaveText("00:00");
    await expect(completeMessage(page)).toHaveCount(0);

    await page.clock.fastForward(1_000);
    await expect(timerDisplay(page)).toHaveText("00:01");
  });

  test("cancelar el abandono no reinicia el temporizador", async ({ page }) => {
    await startTimedGame(page, SPARSE_PUZZLE);
    await write(page, 3, 3, "3");
    await page.clock.fastForward(180_000);
    await expect(timerDisplay(page)).toHaveText("03:00");

    let dialogShown = false;
    page.on("dialog", (dialog) => {
      dialogShown = true;
      void dialog.dismiss();
    });
    await page.click('button:has-text("Nueva partida")');
    expect(dialogShown).toBe(true);
    await expect(page.locator('[data-screen="game"]')).toBeVisible();

    await page.clock.fastForward(1_000);
    const [minutes, seconds] = ((await timerDisplay(page).textContent()) ?? "").split(":").map(Number);
    expect(minutes * 60 + seconds).toBeGreaterThanOrEqual(180);
  });
});
