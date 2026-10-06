import { describe, expect, it } from "vitest";
import css from "./styles.css?raw";
import { contrastRatio, parseColor, relativeLuminance, type Rgba } from "./contrast";

const PALETTE_NAMES = [
  "bg",
  "surface",
  "surface-selected",
  "text",
  "accent",
  "accent-hover",
  "accent-active",
  "on-accent",
  "secondary",
  "secondary-hover",
  "secondary-active",
  "border",
  "grid-line",
  "text-disabled",
  "error",
  "success",
] as const;

function rootVariables(source: string): Map<string, string> {
  const root = /:root\s*\{([^}]*)\}/.exec(source);
  if (!root) {
    throw new Error("styles.css no tiene un bloque :root");
  }
  const variables = new Map<string, string>();
  for (const match of root[1].matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g)) {
    variables.set(match[1], match[2].trim());
  }
  return variables;
}

const variables = rootVariables(css);

function color(name: string): Rgba {
  const value = variables.get(name);
  if (value === undefined) {
    throw new Error(`Falta --color-${name}`);
  }
  return parseColor(value);
}

function sameRgb(a: Rgba, b: Rgba): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b;
}

describe("paleta de styles.css", () => {
  it("define todas las variables de la paleta", () => {
    for (const name of PALETTE_NAMES) {
      expect(variables.has(name), `--color-${name}`).toBe(true);
    }
  });

  it("el fondo es gris azulado muy oscuro y no negro puro", () => {
    const bg = color("bg");
    expect(relativeLuminance(bg)).toBeLessThanOrEqual(0.03);
    expect(bg.b).toBeGreaterThanOrEqual(bg.r);
    expect(bg.b).toBeGreaterThanOrEqual(bg.g);
    expect(sameRgb(bg, parseColor("#000000"))).toBe(false);
  });

  it("el texto principal es blanco", () => {
    expect(sameRgb(color("text"), parseColor("#ffffff"))).toBe(true);
  });

  it("el acento es legible sobre las celdas y distinto del blanco y de los reservados", () => {
    const accent = color("accent");
    expect(contrastRatio(accent, color("surface"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(accent, color("surface-selected"))).toBeGreaterThanOrEqual(4.5);
    expect(sameRgb(accent, parseColor("#ffffff"))).toBe(false);
    expect(sameRgb(accent, color("error"))).toBe(false);
    expect(sameRgb(accent, color("success"))).toBe(false);
  });

  it("los colores reservados son legibles sobre el fondo y distintos entre sí y del acento", () => {
    const error = color("error");
    const success = color("success");
    expect(contrastRatio(error, color("bg"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(success, color("bg"))).toBeGreaterThanOrEqual(4.5);
    expect(sameRgb(error, success)).toBe(false);
    expect(sameRgb(error, color("accent"))).toBe(false);
    expect(sameRgb(success, color("accent"))).toBe(false);
  });

  it("el color de error es legible sobre las celdas, también sobre la seleccionada", () => {
    const error = color("error");
    expect(contrastRatio(error, color("surface"))).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(error, color("surface-selected"))).toBeGreaterThanOrEqual(4.5);
  });

  it("no declara fuentes propias", () => {
    expect(css).not.toMatch(/@font-face/i);
  });

  it("el brillo de la celda seleccionada usa los canales del acento", () => {
    const rule = /\[role="gridcell"\]\[aria-selected="true"\]\s*\{([^}]*)\}/.exec(css);
    // La regla ya existe (tarea 2.2): si desaparece o cambia su selector, el test debe fallar.
    expect(rule, "regla de la celda seleccionada en styles.css").not.toBeNull();
    const shadow = /box-shadow\s*:[^;]*?(rgba?\([^)]*\))/.exec(rule![1]);
    expect(shadow, "box-shadow con rgb() en la celda seleccionada").not.toBeNull();
    expect(sameRgb(parseColor(shadow![1]), color("accent"))).toBe(true);
  });
});
