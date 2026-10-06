import { test, expect } from "@playwright/test";
import { gotoGameScreen } from "./helpers";
import { computed, containsRgb, durations, expectReducedMotion, paletteRgba } from "./support/style";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

test.describe("sin preferencia de movimiento reducido", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await gotoGameScreen(page, PUZZLE);
  });

  test("los botones cambian con una transición de más de 0 y como mucho 250 ms", async ({ page }) => {
    for (const button of await page.locator("button").all()) {
      const { "transition-duration": value } = await computed(button, ["transition-duration"]);
      for (const seconds of durations(value)) {
        expect(seconds).toBeGreaterThan(0);
        expect(seconds).toBeLessThanOrEqual(0.25);
      }
    }
  });

  test("la selección cambia sin animación", async ({ page }) => {
    await page.locator('[data-row="4"][data-col="4"]').click();
    const cells = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="gridcell"]')).map((el) => {
        const s = getComputedStyle(el);
        return { transition: s.transitionDuration, animation: s.animationName };
      }),
    );
    for (const c of cells) {
      expect(durations(c.transition).every((s) => s === 0)).toBe(true);
      expect(c.animation).toBe("none");
    }
  });

  test("las animaciones no retrasan la jugada", async ({ page }) => {
    await page.locator('[data-row="0"][data-col="1"]').click();
    const five = page.locator('[data-digit="5"]');
    await five.hover();
    await five.click();
    // Lectura inmediata, sin la espera automática de las comprobaciones.
    const text = await page.evaluate(
      () => document.querySelector('[data-row="0"][data-col="1"]')?.textContent,
    );
    expect(text).toBe("5");
  });
});

test.describe("con preferencia de movimiento reducido", () => {
  test.beforeEach(async ({ page }) => {
    await expectReducedMotion(page);
    await gotoGameScreen(page, PUZZLE);
  });

  test("no hay transiciones en botones ni celdas", async ({ page }) => {
    const all = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, [role="gridcell"]')).map(
        (el) => getComputedStyle(el).transitionDuration,
      ),
    );
    expect(all.length).toBeGreaterThan(81);
    for (const value of all) {
      expect(durations(value).every((s) => s === 0)).toBe(true);
    }
  });

  test("la celda seleccionada conserva su contorno y su brillo", async ({ page }) => {
    const accent = await paletteRgba(page, "accent");
    const selected = page.locator('[data-row="4"][data-col="4"]');
    await selected.click();
    const cell = await computed(selected, ["outline-style", "box-shadow"]);
    expect(cell["outline-style"]).toBe("solid");
    expect(containsRgb(cell["box-shadow"], accent)).toBe(true);
  });

  test("los botones siguen cambiando al pasar el ratón y al pulsarlos", async ({ page }) => {
    // Sin celda seleccionada, pulsar el 5 no tiene efecto (D8).
    const five = page.locator('[data-digit="5"]');
    const props = ["background-color", "box-shadow", "transform"];
    await page.mouse.move(0, 0);
    const rest = await computed(five, props);
    await five.hover();
    const hover = await computed(five, props);
    expect(hover).not.toEqual(rest);
    await page.mouse.down();
    const pressed = await computed(five, props);
    await page.mouse.up();
    expect(pressed).not.toEqual(hover);
  });
});
