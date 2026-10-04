import { createBoardFromPuzzle } from "../board/create";
import { chooseTargetHints, digHoles, isAttemptSuccessful } from "./digHoles";
import { fillGrid } from "./fillGrid";
import { createRng, deriveAutoSeed, normalizeSeed, type Rng } from "./rng";
import { GeneratorError, GeneratorInternalError, type Difficulty, type GeneratorOptions } from "./types";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];
const DEFAULT_MAX_ATTEMPTS = 100;

export function validateDifficulty(difficulty: unknown): Difficulty {
  if (typeof difficulty !== "string" || !DIFFICULTIES.includes(difficulty as Difficulty)) {
    throw new GeneratorError(
      "invalid_difficulty",
      `Nivel de dificultad inválido: ${JSON.stringify(difficulty)}. Debe ser "easy", "medium" o "hard".`,
    );
  }
  return difficulty as Difficulty;
}

export function validateSeed(seed: unknown): number | null {
  if (seed === undefined || seed === null) return null;
  if (typeof seed !== "number" || !Number.isInteger(seed)) {
    throw new GeneratorError(
      "invalid_seed",
      `Semilla inválida: ${JSON.stringify(seed)}. Debe ser un número entero, null, o no indicarse.`,
    );
  }
  return seed;
}

export interface AttemptResult {
  readonly success: boolean;
  readonly puzzle?: (number | null)[][];
}

export type AttemptFn = (rng: Rng, difficulty: Difficulty) => AttemptResult;

export function runAttempt(rng: Rng, difficulty: Difficulty): AttemptResult {
  const solution = fillGrid(rng);
  const target = chooseTargetHints(rng, difficulty);
  const { puzzle, hintCount } = digHoles(rng, solution, target);

  if (!isAttemptSuccessful(hintCount, difficulty)) {
    return { success: false };
  }
  return { success: true, puzzle };
}

export function generateWithRetries(
  rng: Rng,
  difficulty: Difficulty,
  maxAttempts: number,
  attemptFn: AttemptFn,
): (number | null)[][] {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = attemptFn(rng, difficulty);
    if (result.success && result.puzzle) {
      return result.puzzle;
    }
  }

  throw new GeneratorError(
    "max_attempts_exceeded",
    `No se pudo generar un planteamiento válido para la dificultad "${difficulty}" tras ${maxAttempts} intentos.`,
  );
}

export interface GenerateInternalOptions {
  readonly maxAttempts?: number;
  readonly attemptFn?: AttemptFn;
}

export function generatePuzzleInternal(
  options: GeneratorOptions,
  internalOptions: GenerateInternalOptions = {},
): (number | null)[][] {
  const difficulty = validateDifficulty(options.difficulty);
  const seed = validateSeed(options.seed);
  const maxAttempts = internalOptions.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const attemptFn = internalOptions.attemptFn ?? runAttempt;

  const rngSeed = seed === null ? deriveAutoSeed() : normalizeSeed(seed);
  const rng = createRng(rngSeed);

  const puzzle = generateWithRetries(rng, difficulty, maxAttempts, attemptFn);

  try {
    createBoardFromPuzzle(puzzle);
  } catch {
    throw new GeneratorInternalError(
      "El planteamiento generado no superó la validación final con createBoardFromPuzzle. Esto indica un bug interno del generador.",
    );
  }

  return puzzle;
}

export function generatePuzzle(options: GeneratorOptions): (number | null)[][] {
  return generatePuzzleInternal(options);
}
