import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../board/create";
import { solve } from "../solver/solve";
import { createRng } from "./rng";
import { fillGrid } from "./fillGrid";
import { chooseTargetHints, digHoles, hintRangeFor, isAttemptSuccessful } from "./digHoles";
import type { Difficulty } from "./types";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

describe("chooseTargetHints", () => {
  it("elige siempre un objetivo dentro del rango de pistas de cada nivel", () => {
    for (const difficulty of DIFFICULTIES) {
      const { min, max } = hintRangeFor(difficulty);
      for (let seed = 1; seed <= 20; seed++) {
        const target = chooseTargetHints(createRng(seed), difficulty);
        expect(target).toBeGreaterThanOrEqual(min);
        expect(target).toBeLessThanOrEqual(max);
      }
    }
  });
});

describe("digHoles", () => {
  it("devuelve un planteamiento con solución única según el solver", () => {
    const rng = createRng(1);
    const solution = fillGrid(rng);
    const target = chooseTargetHints(rng, "easy");

    const { puzzle } = digHoles(rng, solution, target);
    const board = createBoardFromPuzzle(puzzle);

    expect(solve(board).status).toBe("unique_solution");
  });
});

describe("isAttemptSuccessful", () => {
  it("es exitoso cuando el número de pistas cae dentro del rango del nivel", () => {
    for (const difficulty of DIFFICULTIES) {
      const { min, max } = hintRangeFor(difficulty);
      expect(isAttemptSuccessful(min, difficulty)).toBe(true);
      expect(isAttemptSuccessful(max, difficulty)).toBe(true);
      expect(isAttemptSuccessful(Math.round((min + max) / 2), difficulty)).toBe(true);
    }
  });

  it("falla cuando el número de pistas queda por encima del rango del nivel", () => {
    for (const difficulty of DIFFICULTIES) {
      const { max } = hintRangeFor(difficulty);
      expect(isAttemptSuccessful(max + 1, difficulty)).toBe(false);
    }
  });

  it("falla cuando el número de pistas queda por debajo del rango del nivel", () => {
    for (const difficulty of DIFFICULTIES) {
      const { min } = hintRangeFor(difficulty);
      expect(isAttemptSuccessful(min - 1, difficulty)).toBe(false);
    }
  });
});
