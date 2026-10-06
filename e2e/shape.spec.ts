import { test, expect, type Page } from "@playwright/test";
import { gotoGameScreen } from "./helpers";
import { computed, expectReducedMotion, paletteRgba, parseColor, sameRgb } from "./support/style";

const PUZZLE: (number | null)[][] = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => (row === 0 && col === 0 ? 5 : null)),
);

const cell = (page: Page, row: number, col: number) =>
  page.locator(`[role="gridcell"][data-row="${row}"][data-col="${col}"]`);

test.beforeEach(async ({ page }) => {
  await expectReducedMotion(page);
  await gotoGameScreen(page, PUZZLE);
});

test("el contorno exterior del tablero tiene esquinas redondeadas", async ({ page }) => {
  const style = await computed(page.getByRole("grid"), [
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
  ]);
  for (const value of Object.values(style)) {
    expect(parseFloat(value)).toBeGreaterThan(0);
  }
});

test("el tablero proyecta una sombra", async ({ page }) => {
  const { "box-shadow": shadow } = await computed(page.getByRole("grid"), ["box-shadow"]);
  expect(shadow).not.toBe("none");
});

test("con el redondeo, los bordes entre cuadros de 3x3 siguen siendo más gruesos", async ({ page }) => {
  const inner = await computed(cell(page, 4, 0), ["border-right-width", "border-bottom-width"]);
  const vertical = await computed(cell(page, 4, 2), ["border-right-width"]);
  const horizontal = await computed(cell(page, 2, 4), ["border-bottom-width"]);

  expect(parseFloat(vertical["border-right-width"])).toBeGreaterThan(parseFloat(inner["border-right-width"]));
  expect(parseFloat(horizontal["border-bottom-width"])).toBeGreaterThan(
    parseFloat(inner["border-bottom-width"]),
  );
});

test("el indicador de la esquina superior izquierda no queda recortado", async ({ page }) => {
  await cell(page, 0, 0).click();
  const accent = await paletteRgba(page, "accent");

  const { overflow } = await computed(page.getByRole("grid"), ["overflow"]);
  expect(overflow).toBe("visible");

  const style = await computed(cell(page, 0, 0), [
    "outline-style",
    "outline-width",
    "outline-offset",
    "outline-color",
  ]);
  expect(style["outline-style"]).toBe("solid");
  expect(parseFloat(style["outline-width"])).toBeGreaterThanOrEqual(2);
  // Hacia dentro: el contorno queda dentro de la celda, no fuera del tablero.
  expect(parseFloat(style["outline-offset"])).toBeLessThanOrEqual(-parseFloat(style["outline-width"]));
  expect(sameRgb(parseColor(style["outline-color"]), accent)).toBe(true);
});

// Escenario: "El indicador no se recorta en las esquinas del tablero", medido en los píxeles
// pintados: el contorno de acento aparece en los cuatro lados de la celda (0,0), también
// junto a sus esquinas redondeadas.
test("el contorno de la celda (0,0) se ve pintado en sus cuatro lados", async ({ page }) => {
  const target = cell(page, 0, 0);
  await target.click();
  await page.mouse.move(0, 0);
  const accent = await paletteRgba(page, "accent");

  const box = (await target.boundingBox())!;
  const clip = { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) };
  const png = await page.screenshot({ clip });

  const samples = await page.evaluate(async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const img = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const at = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data.slice(0, 3));
    const w = img.width;
    const h = img.height;
    const mx = Math.floor(w / 2);
    const my = Math.floor(h / 2);
    // A 1 px del borde de la celda: dentro del contorno de 2 px hacia dentro.
    return {
      "arriba (centro)": at(mx, 1),
      "abajo (centro)": at(mx, h - 2),
      "izquierda (centro)": at(1, my),
      "derecha (centro)": at(w - 2, my),
      // Junto a la esquina redondeada exterior (radio de 9 px).
      "arriba (cerca de la esquina)": at(12, 1),
      "izquierda (cerca de la esquina)": at(1, 12),
    };
  }, png.toString("base64"));

  for (const [where, [r, g, b]] of Object.entries(samples)) {
    const distance = Math.max(Math.abs(r - accent.r), Math.abs(g - accent.g), Math.abs(b - accent.b));
    expect(distance, `${where}: rgb(${r}, ${g}, ${b})`).toBeLessThanOrEqual(40);
  }
});
