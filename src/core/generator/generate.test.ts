import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../board/create";
import { GeneratorError, GeneratorInternalError } from "./types";
import {
  generatePuzzle,
  generatePuzzleInternal,
  generateWithRetries,
  validateDifficulty,
  validateSeed,
  type AttemptFn,
} from "./generate";
import { createRng } from "./rng";

describe("validateDifficulty", () => {
  it("lanza GeneratorError para un nivel de dificultad desconocido", () => {
    expect(() => validateDifficulty("expert")).toThrow(GeneratorError);
    expect(() => validateDifficulty("")).toThrow(GeneratorError);
  });

  it("acepta easy, medium y hard", () => {
    expect(validateDifficulty("easy")).toBe("easy");
    expect(validateDifficulty("medium")).toBe("medium");
    expect(validateDifficulty("hard")).toBe("hard");
  });
});

describe("validateSeed", () => {
  it("lanza GeneratorError para una semilla que no es un entero", () => {
    expect(() => validateSeed("42")).toThrow(GeneratorError);
    expect(() => validateSeed(3.5)).toThrow(GeneratorError);
    expect(() => validateSeed(NaN)).toThrow(GeneratorError);
    expect(() => validateSeed(Infinity)).toThrow(GeneratorError);
  });

  it("trata null y undefined como 'sin semilla', sin lanzar error", () => {
    expect(validateSeed(null)).toBeNull();
    expect(validateSeed(undefined)).toBeNull();
  });

  it("acepta enteros positivos y negativos", () => {
    expect(validateSeed(42)).toBe(42);
    expect(validateSeed(-42)).toBe(-42);
  });
});

const ALWAYS_FAILS: AttemptFn = () => ({ success: false });

describe("generateWithRetries - límite de reintentos", () => {
  it("con maxAttempts = 0 lanza GeneratorError inmediatamente, sin ejecutar ningún intento", () => {
    let calls = 0;
    const attemptFn: AttemptFn = () => {
      calls++;
      return { success: true, puzzle: [] };
    };

    expect(() => generateWithRetries(createRng(1), "easy", 0, attemptFn)).toThrow(GeneratorError);
    expect(calls).toBe(0);
  });

  it("con maxAttempts = 3 y un intento que siempre falla, ejecuta exactamente 3 intentos y lanza GeneratorError", () => {
    let calls = 0;
    const attemptFn: AttemptFn = (rng, difficulty) => {
      calls++;
      return ALWAYS_FAILS(rng, difficulty);
    };

    expect(() => generateWithRetries(createRng(1), "easy", 3, attemptFn)).toThrow(GeneratorError);
    expect(calls).toBe(3);
  });
});

describe("generatePuzzle - reproducibilidad con semilla", () => {
  it("llamado dos veces con la misma semilla y dificultad devuelve el mismo planteamiento", () => {
    const first = generatePuzzle({ difficulty: "easy", seed: 123 });
    const second = generatePuzzle({ difficulty: "easy", seed: 123 });
    expect(first).toEqual(second);
  });
});

describe("generatePuzzle - semilla null equivale a no indicar semilla", () => {
  it("genera un planteamiento sin lanzar error con seed: null", () => {
    expect(() => generatePuzzle({ difficulty: "easy", seed: null })).not.toThrow();
  });

  it("diez generaciones con seed: null no producen todas el mismo planteamiento (null no se trata como semilla 0)", () => {
    const puzzles = Array.from({ length: 10 }, () => generatePuzzle({ difficulty: "easy", seed: null }));
    const allEqual = puzzles.every((puzzle) => JSON.stringify(puzzle) === JSON.stringify(puzzles[0]));
    expect(allEqual).toBe(false);
  });
});

describe("generatePuzzle - compatibilidad con sudoku-board", () => {
  it("el planteamiento devuelto se puede usar para crear un tablero sin error", () => {
    const puzzle = generatePuzzle({ difficulty: "medium", seed: 1 });
    expect(() => createBoardFromPuzzle(puzzle)).not.toThrow();
  });
});

describe("generatePuzzleInternal - error interno en la validación final", () => {
  it("lanza GeneratorInternalError (no GeneratorError) y no reintenta si el intento inyectado da un planteamiento inválido", () => {
    const invalidPuzzle: (number | null)[][] = Array.from({ length: 9 }, () =>
      Array<number | null>(9).fill(null),
    );
    invalidPuzzle[0][0] = 5;
    invalidPuzzle[0][1] = 5; // repite valor en la misma fila: invalido para createBoardFromPuzzle

    let calls = 0;
    const attemptFn: AttemptFn = () => {
      calls++;
      return { success: true, puzzle: invalidPuzzle };
    };

    expect(() =>
      generatePuzzleInternal({ difficulty: "easy", seed: 1 }, { maxAttempts: 5, attemptFn }),
    ).toThrow(GeneratorInternalError);
    expect(calls).toBe(1);
  });
});
