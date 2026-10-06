import { describe, expect, it } from "vitest";
import { contrastRatio, parseColor, relativeLuminance } from "./contrast";

describe("parseColor", () => {
  it("lee un color hexadecimal", () => {
    expect(parseColor("#38bdf8")).toEqual({ r: 56, g: 189, b: 248, a: 1 });
  });

  it("lee rgb() con comas, como lo devuelve getComputedStyle", () => {
    expect(parseColor("rgb(15, 23, 42)")).toEqual({ r: 15, g: 23, b: 42, a: 1 });
  });

  it("conserva el alfa de rgba()", () => {
    expect(parseColor("rgba(56, 189, 248, 0.5)")).toEqual({ r: 56, g: 189, b: 248, a: 0.5 });
  });

  it("lee la sintaxis moderna rgb(r g b / a)", () => {
    expect(parseColor("rgb(56 189 248 / 0.55)")).toEqual({ r: 56, g: 189, b: 248, a: 0.55 });
  });

  it("rechaza un formato no soportado", () => {
    expect(() => parseColor("blue")).toThrow();
  });
});

describe("contrastRatio", () => {
  it("blanco sobre negro da 21", () => {
    expect(contrastRatio(parseColor("#ffffff"), parseColor("#000000"))).toBeCloseTo(21, 5);
  });

  it("un color sobre sí mismo da 1", () => {
    const color = parseColor("#38bdf8");
    expect(contrastRatio(color, color)).toBe(1);
  });

  it("el acento sobre el fondo de las celdas da 6,83", () => {
    const ratio = contrastRatio(parseColor("#38bdf8"), parseColor("#1e293b"));
    expect(Math.abs(ratio - 6.83)).toBeLessThanOrEqual(0.01);
  });

  it("es simétrico", () => {
    const a = parseColor("#0f172a");
    const b = parseColor("#7dd3fc");
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe("relativeLuminance", () => {
  it("es 0 para el negro y 1 para el blanco", () => {
    expect(relativeLuminance(parseColor("#000000"))).toBe(0);
    expect(relativeLuminance(parseColor("#ffffff"))).toBeCloseTo(1, 10);
  });
});
