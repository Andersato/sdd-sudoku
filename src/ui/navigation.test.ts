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

  it("devuelve false de nuevo tras borrar ese mismo número", () => {
    const { board: withValue } = place(freshBoard(), { row: 1, col: 1 }, 7);
    const cleared = clear(withValue, { row: 1, col: 1 });
    expect(shouldConfirmNewGame(cleared)).toBe(false);
  });
});
