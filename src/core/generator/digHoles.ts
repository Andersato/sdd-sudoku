import { BOARD_SIZE, type Coord } from "../board/types";
import { createBoardFromPuzzle } from "../board/create";
import { solve } from "../solver/solve";
import { nextInt, shuffle, type Rng } from "./rng";
import type { Difficulty } from "./types";
import type { Grid } from "./fillGrid";

export interface HintRange {
  readonly min: number;
  readonly max: number;
}

const HINT_RANGES: Record<Difficulty, HintRange> = {
  easy: { min: 36, max: 45 },
  medium: { min: 30, max: 35 },
  hard: { min: 24, max: 29 },
};

export function hintRangeFor(difficulty: Difficulty): HintRange {
  return HINT_RANGES[difficulty];
}

export function chooseTargetHints(rng: Rng, difficulty: Difficulty): number {
  const { min, max } = hintRangeFor(difficulty);
  return nextInt(rng, min, max);
}

export function isAttemptSuccessful(hintCount: number, difficulty: Difficulty): boolean {
  const { min, max } = hintRangeFor(difficulty);
  return hintCount >= min && hintCount <= max;
}

function allCoords(): Coord[] {
  const coords: Coord[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      coords.push({ row, col });
    }
  }
  return coords;
}

export interface DigHolesResult {
  readonly puzzle: (number | null)[][];
  readonly hintCount: number;
}

export function digHoles(rng: Rng, solutionGrid: Grid, targetHints: number): DigHolesResult {
  const puzzle: (number | null)[][] = solutionGrid.map((row) => [...row]);
  let hintCount = BOARD_SIZE * BOARD_SIZE;

  for (const { row, col } of shuffle(rng, allCoords())) {
    if (hintCount <= targetHints) break;

    const previousValue = puzzle[row][col];
    puzzle[row][col] = null;

    const board = createBoardFromPuzzle(puzzle);
    const result = solve(board);

    if (result.status === "unique_solution") {
      hintCount -= 1;
    } else {
      puzzle[row][col] = previousValue;
    }
  }

  return { puzzle, hintCount };
}
