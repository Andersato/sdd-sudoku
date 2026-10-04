import { describe, expect, it } from "vitest";
import { createRng, normalizeSeed } from "./rng";

function sequence(seed: number, length: number): number[] {
  const rng = createRng(seed);
  return Array.from({ length }, () => rng());
}

describe("rng - mulberry32 determinista", () => {
  it("produce siempre la misma secuencia para la misma semilla", () => {
    expect(sequence(42, 10)).toEqual(sequence(42, 10));
  });

  it("produce secuencias distintas para semillas distintas", () => {
    expect(sequence(1, 10)).not.toEqual(sequence(2, 10));
  });

  it("normaliza una semilla negativa de forma determinista e igual a la normalización manual", () => {
    const negativeSeed = -42;
    expect(sequence(negativeSeed, 10)).toEqual(sequence(negativeSeed, 10));
    expect(sequence(negativeSeed, 10)).toEqual(sequence(normalizeSeed(negativeSeed), 10));
  });
});
