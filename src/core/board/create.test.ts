import { describe, expect, it } from "vitest";
import { BOARD_SIZE } from "./types";
import { createBoardFromPuzzle, createEmptyBoard } from "./create";

describe("createEmptyBoard", () => {
  it("devuelve 81 celdas vacías y editables", () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(BOARD_SIZE);
    for (const row of board) {
      expect(row.length).toBe(BOARD_SIZE);
      for (const cell of row) {
        expect(cell.value).toBeNull();
        expect(cell.fixed).toBe(false);
      }
    }
  });
});

function emptyPuzzle(): (number | null)[][] {
  return Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
}

describe("createBoardFromPuzzle", () => {
  it("refleja los valores del planteamiento mixto en sus mismas posiciones", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 5;
    puzzle[3][4] = 9;

    const board = createBoardFromPuzzle(puzzle);

    expect(board[0][0].value).toBe(5);
    expect(board[3][4].value).toBe(9);
    expect(board[8][8].value).toBeNull();
  });

  it("marca como fija una celda con valor en el planteamiento", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 5;

    const board = createBoardFromPuzzle(puzzle);

    expect(board[0][0].fixed).toBe(true);
    expect(board[0][0].value).toBe(5);
  });

  it("marca como editable una celda vacía del planteamiento", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][1] = null;

    const board = createBoardFromPuzzle(puzzle);

    expect(board[0][1].fixed).toBe(false);
    expect(board[0][1].value).toBeNull();
  });

  it("acepta 0 como celda vacía igual que null", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][2] = 0;

    const board = createBoardFromPuzzle(puzzle);

    expect(board[0][2].fixed).toBe(false);
    expect(board[0][2].value).toBeNull();
  });

  it("rechaza un planteamiento con menos de 9 filas", () => {
    const puzzle = emptyPuzzle().slice(0, 8);
    expect(() => createBoardFromPuzzle(puzzle)).toThrow(/invalid_puzzle|debe tener/i);
  });

  it("rechaza un planteamiento con una fila de longitud incorrecta", () => {
    const puzzle = emptyPuzzle();
    puzzle[0] = puzzle[0].slice(0, 8);
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un valor fuera de rango (mayor que 9)", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 10;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un valor fuera de rango (negativo)", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = -1;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un valor decimal como 3.5", () => {
    const puzzle = emptyPuzzle();
    (puzzle[0] as unknown[])[0] = 3.5;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un valor de tipo string", () => {
    const puzzle = emptyPuzzle();
    (puzzle[0] as unknown[])[0] = "5";
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un número repetido en la misma fila", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 5;
    puzzle[0][1] = 5;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un número repetido en la misma columna", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 5;
    puzzle[1][0] = 5;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });

  it("rechaza un número repetido en el mismo cuadro 3x3", () => {
    const puzzle = emptyPuzzle();
    puzzle[0][0] = 5;
    puzzle[1][1] = 5;
    expect(() => createBoardFromPuzzle(puzzle)).toThrow();
  });
});
