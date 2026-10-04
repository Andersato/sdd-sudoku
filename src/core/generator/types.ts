export type Difficulty = "easy" | "medium" | "hard";

export interface GeneratorOptions {
  readonly difficulty: Difficulty;
  readonly seed?: number | null;
}

export type GeneratorErrorCode = "invalid_difficulty" | "invalid_seed" | "max_attempts_exceeded";

export class GeneratorError extends Error {
  readonly code: GeneratorErrorCode;

  constructor(code: GeneratorErrorCode, message: string) {
    super(message);
    this.name = "GeneratorError";
    this.code = code;
  }
}

export class GeneratorInternalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeneratorInternalError";
  }
}
