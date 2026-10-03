import { describe, expect, it } from "vitest";
import { createEmptyBoard, createBoardFromPuzzle } from "./create";
import { clear, place } from "./mutate";

describe("place", () => {
  it("coloca un número en una celda editable vacía", () => {
    const board = createEmptyBoard();
    const { board: next } = place(board, { row: 0, col: 0 }, 7);
    expect(next[0][0].value).toBe(7);
  });

  it("reemplaza el valor existente de una celda editable", () => {
    const board = createEmptyBoard();
    const { board: afterFirst } = place(board, { row: 0, col: 0 }, 9);
    const { board: afterSecond } = place(afterFirst, { row: 0, col: 0 }, 3);
    expect(afterSecond[0][0].value).toBe(3);
  });

  it("no muta el tablero original", () => {
    const board = createEmptyBoard();
    place(board, { row: 0, col: 0 }, 7);
    expect(board[0][0].value).toBeNull();
  });

  it("rechaza colocar en una celda fija", () => {
    const board = createBoardFromPuzzle([
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

    expect(() => place(board, { row: 0, col: 0 }, 3)).toThrow();
    expect(board[0][0].value).toBe(5);
  });

  it("rechaza un valor fuera de rango", () => {
    const board = createEmptyBoard();
    expect(() => place(board, { row: 0, col: 0 }, 0)).toThrow();
    expect(() => place(board, { row: 0, col: 0 }, 10)).toThrow();
    expect(board[0][0].value).toBeNull();
  });

  it("rechaza un valor no entero", () => {
    const board = createEmptyBoard();
    expect(() => place(board, { row: 0, col: 0 }, 3.5)).toThrow();
    expect(() => place(board, { row: 0, col: 0 }, "5")).toThrow();
  });

  it("rechaza coordenadas fuera del tablero", () => {
    const board = createEmptyBoard();
    expect(() => place(board, { row: -1, col: 0 }, 5)).toThrow();
    expect(() => place(board, { row: 0, col: 9 }, 5)).toThrow();
  });
});

describe("clear", () => {
  it("borra el valor de una celda editable con valor", () => {
    const board = createEmptyBoard();
    const { board: withValue } = place(board, { row: 0, col: 0 }, 7);
    const cleared = clear(withValue, { row: 0, col: 0 });
    expect(cleared[0][0].value).toBeNull();
  });

  it("borrar una celda editable ya vacía no produce error", () => {
    const board = createEmptyBoard();
    expect(() => clear(board, { row: 0, col: 0 })).not.toThrow();
    expect(clear(board, { row: 0, col: 0 })[0][0].value).toBeNull();
  });

  it("no muta el tablero original", () => {
    const board = createEmptyBoard();
    const { board: withValue } = place(board, { row: 0, col: 0 }, 7);
    clear(withValue, { row: 0, col: 0 });
    expect(withValue[0][0].value).toBe(7);
  });

  it("rechaza borrar una celda fija", () => {
    const board = createBoardFromPuzzle([
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

    expect(() => clear(board, { row: 0, col: 0 })).toThrow();
    expect(board[0][0].value).toBe(5);
  });

  it("rechaza coordenadas fuera del tablero", () => {
    const board = createEmptyBoard();
    expect(() => clear(board, { row: 9, col: 0 })).toThrow();
  });
});
