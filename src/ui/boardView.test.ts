import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../core/board/create";
import { handleDigit, handleErase } from "./boardView";

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

  it("vacía el valor de una celda editable seleccionada", () => {
    const board = testBoard();
    const withValue = handleDigit(board, { row: 1, col: 1 }, 7);
    const cleared = handleErase(withValue, { row: 1, col: 1 });
    expect(cleared[1][1].value).toBeNull();
  });
});
