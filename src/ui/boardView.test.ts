import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../core/board/create";
import { place } from "../core/board/mutate";
import { handleDigit, handleErase } from "./boardView";

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

/** Tablero resuelto en el que (0,2) = 4 lo ha puesto el jugador; el resto es fijo. */
function solvedBoard() {
  const puzzle = REFERENCE_SOLUTION.map((row, r) => row.map((v, c) => (r === 0 && c === 2 ? null : v)));
  return place(createBoardFromPuzzle(puzzle), { row: 0, col: 2 }, 4).board;
}

function testBoard() {
  return createBoardFromPuzzle([
    [5, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
  ]);
}

describe("handleDigit", () => {
  it("no hace nada sin ninguna celda seleccionada", () => {
    const board = testBoard();
    expect(handleDigit(board, null, 7)).toBe(board);
  });

  it("no hace nada con una celda fija seleccionada", () => {
    const board = testBoard();
    expect(handleDigit(board, { row: 0, col: 0 }, 7)).toBe(board);
  });

  it("no hace nada con la partida completada", () => {
    const board = solvedBoard();
    expect(handleDigit(board, { row: 0, col: 2 }, 7)).toBe(board);
  });

  it("coloca el valor en una celda editable seleccionada", () => {
    const board = testBoard();
    const next = handleDigit(board, { row: 1, col: 1 }, 7);
    expect(next[1][1].value).toBe(7);
  });
});

describe("handleErase", () => {
  it("no hace nada sin ninguna celda seleccionada", () => {
    const board = testBoard();
    expect(handleErase(board, null)).toBe(board);
  });

  it("no hace nada con una celda fija seleccionada", () => {
    const board = testBoard();
    expect(handleErase(board, { row: 0, col: 0 })).toBe(board);
  });

  it("no hace nada con la partida completada", () => {
    const board = solvedBoard();
    expect(handleErase(board, { row: 0, col: 2 })).toBe(board);
  });

  it("vacía el valor de una celda editable seleccionada", () => {
    const board = testBoard();
    const withValue = handleDigit(board, { row: 1, col: 1 }, 7);
    const cleared = handleErase(withValue, { row: 1, col: 1 });
    expect(cleared[1][1].value).toBeNull();
  });
});
