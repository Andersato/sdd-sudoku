import { beforeAll, describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../board/create";
import { solve } from "../solver/solve";
import { hintRangeFor } from "./digHoles";
import { generatePuzzle } from "./generate";
import type { Difficulty } from "./types";

interface ReferenceCase {
  readonly seed: number;
  readonly difficulty: Difficulty;
}

function buildReferenceCases(): ReferenceCase[] {
  const cases: ReferenceCase[] = [];
  for (let seed = 1; seed <= 10; seed++) cases.push({ seed, difficulty: "easy" });
  for (let seed = 11; seed <= 20; seed++) cases.push({ seed, difficulty: "medium" });
  for (let seed = 21; seed <= 30; seed++) cases.push({ seed, difficulty: "hard" });
  return cases;
}

const REFERENCE_CASES = buildReferenceCases();

interface GeneratedReference extends ReferenceCase {
  readonly puzzle: (number | null)[][];
  readonly durationMs: number;
}

function countHints(puzzle: (number | null)[][]): number {
  return puzzle.flat().filter((value) => value !== null).length;
}

let generated: GeneratedReference[] = [];

beforeAll(() => {
  generated = REFERENCE_CASES.map(({ seed, difficulty }) => {
    const start = performance.now();
    const puzzle = generatePuzzle({ difficulty, seed });
    const durationMs = performance.now() - start;
    return { seed, difficulty, puzzle, durationMs };
  });
}, 70_000);

describe("generador - semillas de referencia", () => {
  it.each(REFERENCE_CASES)(
    "semilla $seed ($difficulty): solución única y pistas dentro del rango del nivel",
    ({ seed, difficulty }) => {
      const entry = generated.find((candidate) => candidate.seed === seed);
      if (!entry) throw new Error(`No se generó la semilla de referencia ${seed}.`);

      const board = createBoardFromPuzzle(entry.puzzle);
      expect(solve(board).status).toBe("unique_solution");

      const { min, max } = hintRangeFor(difficulty);
      const hintCount = countHints(entry.puzzle);
      expect(hintCount).toBeGreaterThanOrEqual(min);
      expect(hintCount).toBeLessThanOrEqual(max);
    },
  );

  it("no hay dos planteamientos de referencia exactamente iguales entre sí", () => {
    for (let i = 0; i < generated.length; i++) {
      for (let j = i + 1; j < generated.length; j++) {
        expect(generated[i].puzzle).not.toEqual(generated[j].puzzle);
      }
    }
  });

  it(
    "generar diez planteamientos sin semilla no produce diez planteamientos todos iguales entre sí",
    () => {
      const puzzles = Array.from({ length: 10 }, () => generatePuzzle({ difficulty: "easy" }));
      const allEqual = puzzles.every((puzzle) => JSON.stringify(puzzle) === JSON.stringify(puzzles[0]));
      expect(allEqual).toBe(false);
    },
    6_000,
  );

  it.each(REFERENCE_CASES)(
    "semilla $seed ($difficulty): la generación se completa en menos de 2 segundos",
    ({ seed }) => {
      const entry = generated.find((candidate) => candidate.seed === seed);
      if (!entry) throw new Error(`No se generó la semilla de referencia ${seed}.`);

      expect(entry.durationMs).toBeLessThan(2000);
    },
  );
});
