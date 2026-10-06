import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle } from "../core/board/create";
import { clear, place } from "../core/board/mutate";
import { nextSelection, shouldConfirmNewGame } from "./navigation";

describe("nextSelection", () => {
  const center = { row: 4, col: 4 };

  it("arriba, desde una celda central", () => {
    expect(nextSelection(center, "ArrowUp")).toEqual({ row: 3, col: 4 });
  });

  it("abajo, desde una celda central", () => {
    expect(nextSelection(center, "ArrowDown")).toEqual({ row: 5, col: 4 });
  });

  it("izquierda, desde una celda central", () => {
    expect(nextSelection(center, "ArrowLeft")).toEqual({ row: 4, col: 3 });
  });

  it("derecha, desde una celda central", () => {
    expect(nextSelection(center, "ArrowRight")).toEqual({ row: 4, col: 5 });
  });

  it("sin ninguna celda seleccionada devuelve siempre la esquina superior izquierda", () => {
    expect(nextSelection(null, "ArrowUp")).toEqual({ row: 0, col: 0 });
    expect(nextSelection(null, "ArrowDown")).toEqual({ row: 0, col: 0 });
    expect(nextSelection(null, "ArrowLeft")).toEqual({ row: 0, col: 0 });
    expect(nextSelection(null, "ArrowRight")).toEqual({ row: 0, col: 0 });
  });

  it("borde superior: ArrowUp no cambia la celda", () => {
    expect(nextSelection({ row: 0, col: 4 }, "ArrowUp")).toEqual({ row: 0, col: 4 });
  });

  it("borde inferior: ArrowDown no cambia la celda", () => {
    expect(nextSelection({ row: 8, col: 4 }, "ArrowDown")).toEqual({ row: 8, col: 4 });
  });

  it("borde izquierdo: ArrowLeft no cambia la celda", () => {
    expect(nextSelection({ row: 4, col: 0 }, "ArrowLeft")).toEqual({ row: 4, col: 0 });
  });

  it("borde derecho: ArrowRight no cambia la celda", () => {
    expect(nextSelection({ row: 4, col: 8 }, "ArrowRight")).toEqual({ row: 4, col: 8 });
  });
});

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

function freshBoard() {
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

describe("shouldConfirmNewGame", () => {
  it("devuelve false para un tablero recién generado", () => {
    expect(shouldConfirmNewGame(freshBoard())).toBe(false);
  });

  it("devuelve true tras colocar un número en una celda editable", () => {
    const { board } = place(freshBoard(), { row: 1, col: 1 }, 7);
    expect(shouldConfirmNewGame(board)).toBe(true);
  });

  it("devuelve false con la partida completada aunque haya números del jugador", () => {
    const board = solvedBoard();
    expect(board[0][2]).toEqual({ value: 4, fixed: false });
    expect(shouldConfirmNewGame(board)).toBe(false);
  });

  it("devuelve false de nuevo tras borrar ese mismo número", () => {
    const { board: withValue } = place(freshBoard(), { row: 1, col: 1 }, 7);
    const cleared = clear(withValue, { row: 1, col: 1 });
    expect(shouldConfirmNewGame(cleared)).toBe(false);
  });
});
