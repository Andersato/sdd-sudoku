import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../board/create";
import { assertValidSolution } from "./solutionAssertions.test-helpers";
import type { Solution } from "./types";

function puzzleWithFixedCell(): number[][] {
  const puzzle = Array.from({ length: 9 }, () => Array(9).fill(null)) as (number | null)[][];
  puzzle[0][0] = 5;
  return puzzle as number[][];
}

const validSolution: Solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

describe("assertValidSolution", () => {
  it("no lanza error para una solución válida que conserva las celdas fijas", () => {
    const board = createBoardFromPuzzle(puzzleWithFixedCell());
    expect(() => assertValidSolution(validSolution, board)).not.toThrow();
  });

  it("lanza error si una celda fija cambia de valor en la solución", () => {
    const board = createBoardFromPuzzle(puzzleWithFixedCell());
    const wrongSolution = validSolution.map((row) => row.slice());
    wrongSolution[0][0] = 9;
    expect(() => assertValidSolution(wrongSolution, board)).toThrow();
  });

  it("lanza error si una fila repite un número", () => {
    const board = createBoardFromPuzzle(puzzleWithFixedCell());
    const wrongSolution = validSolution.map((row) => row.slice());
    wrongSolution[0][1] = wrongSolution[0][0];
    expect(() => assertValidSolution(wrongSolution, board)).toThrow();
  });
});
