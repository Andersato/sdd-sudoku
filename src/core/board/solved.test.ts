import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle, createEmptyBoard } from "./create";
import { clear, place } from "./mutate";
import { isSolved } from "./solved";
import type { Board } from "./types";

const REFERENCE_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const REFERENCE_SOLUTION = [
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

function solvedReferenceBoard(): Board {
  let board = createBoardFromPuzzle(REFERENCE_PUZZLE);
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!board[row][col].fixed) {
        board = place(board, { row, col }, REFERENCE_SOLUTION[row][col]).board;
      }
    }
  }
  return board;
}

describe("isSolved", () => {
  it("tablero lleno y sin conflictos", () => {
    expect(isSolved(solvedReferenceBoard())).toBe(true);
  });

  it("tablero con una celda vacía", () => {
    const board = clear(solvedReferenceBoard(), { row: 0, col: 2 });
    expect(isSolved(board)).toBe(false);
  });

  it("tablero lleno con un conflicto", () => {
    const board = place(solvedReferenceBoard(), { row: 0, col: 2 }, 5).board;
    expect(isSolved(board)).toBe(false);
  });

  it("tablero vacío", () => {
    expect(isSolved(createEmptyBoard())).toBe(false);
  });

  it("la consulta no modifica el tablero", () => {
    const board = solvedReferenceBoard();
    const before = structuredClone(board);
    isSolved(board);
    expect(board).toEqual(before);
  });
});
