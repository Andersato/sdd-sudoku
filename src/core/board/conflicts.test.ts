import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle, createEmptyBoard } from "./create";
import { getCellConflicts, getConflicts } from "./conflicts";
import { clear, place } from "./mutate";
import { SudokuBoardError } from "./types";

describe("getCellConflicts", () => {
  it("detecta conflicto en la misma fila", () => {
    const board = createEmptyBoard();
    const { board: afterFirst } = place(board, { row: 0, col: 0 }, 5);
    const conflicts = getCellConflicts(afterFirst, { row: 0, col: 1 });
    // la celda (0,1) está vacía, no hay conflicto propio; probamos colocando 5 ahí
    const { board: afterSecond } = place(afterFirst, { row: 0, col: 1 }, 5);
    expect(getCellConflicts(afterSecond, { row: 0, col: 1 })).toEqual([{ row: 0, col: 0 }]);
    expect(conflicts).toEqual([]);
  });

  it("detecta conflicto en la misma columna", () => {
    const board = createEmptyBoard();
    const { board: afterFirst } = place(board, { row: 0, col: 0 }, 5);
    const { board: afterSecond } = place(afterFirst, { row: 1, col: 0 }, 5);
    expect(getCellConflicts(afterSecond, { row: 1, col: 0 })).toEqual([{ row: 0, col: 0 }]);
  });

  it("detecta conflicto en el mismo cuadro 3x3", () => {
    const board = createEmptyBoard();
    const { board: afterFirst } = place(board, { row: 0, col: 0 }, 5);
    const { board: afterSecond } = place(afterFirst, { row: 1, col: 1 }, 5);
    expect(getCellConflicts(afterSecond, { row: 1, col: 1 })).toEqual([{ row: 0, col: 0 }]);
  });

  it("incluye una celda fija en conflicto", () => {
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

    const { board: afterPlace, conflicts } = place(board, { row: 0, col: 1 }, 5);
    expect(conflicts).toEqual([{ row: 0, col: 0 }]);
    expect(getCellConflicts(afterPlace, { row: 0, col: 1 })).toEqual([{ row: 0, col: 0 }]);
  });

  it("lanza SudokuBoardError 'out_of_bounds' para coordenadas fuera de rango", () => {
    const board = createEmptyBoard();

    expect(() => getCellConflicts(board, { row: 9, col: 0 })).toThrow(SudokuBoardError);
    try {
      getCellConflicts(board, { row: -1, col: 0 });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(SudokuBoardError);
      expect((error as SudokuBoardError).code).toBe("out_of_bounds");
    }
  });
});

describe("place: conflictos de la jugada", () => {
  it("permite la jugada aunque sea conflictiva", () => {
    const board = createEmptyBoard();
    const { board: afterFirst } = place(board, { row: 0, col: 0 }, 5);
    const { board: afterSecond, conflicts } = place(afterFirst, { row: 0, col: 1 }, 5);
    expect(afterSecond[0][1].value).toBe(5);
    expect(conflicts.length).toBeGreaterThan(0);
  });

  it("conflicto con varias celdas a la vez (fila y cuadro)", () => {
    let board = createEmptyBoard();
    board = place(board, { row: 0, col: 0 }, 5).board; // fila y cuadro con (0,2)
    board = place(board, { row: 1, col: 1 }, 5).board; // cuadro con (0,2)
    const { conflicts } = place(board, { row: 0, col: 2 }, 5);
    expect(conflicts).toEqual(
      expect.arrayContaining([{ row: 0, col: 0 }, { row: 1, col: 1 }]),
    );
    expect(conflicts.length).toBe(2);
  });

  it("jugada sin conflicto devuelve lista vacía", () => {
    const board = createEmptyBoard();
    const { conflicts } = place(board, { row: 0, col: 0 }, 5);
    expect(conflicts).toEqual([]);
  });
});

describe("getConflicts", () => {
  it("tablero sin conflictos devuelve lista vacía", () => {
    const board = createEmptyBoard();
    expect(getConflicts(board)).toEqual([]);
  });

  it("tablero con conflictos acumulados en fila, columna y cuadro 3x3", () => {
    let board = createEmptyBoard();
    board = place(board, { row: 0, col: 0 }, 5).board;
    board = place(board, { row: 0, col: 1 }, 5).board; // fila 0
    board = place(board, { row: 2, col: 3 }, 7).board;
    board = place(board, { row: 5, col: 3 }, 7).board; // columna 3
    board = place(board, { row: 6, col: 6 }, 9).board;
    board = place(board, { row: 7, col: 7 }, 9).board; // cuadro inferior derecho

    const conflicts = getConflicts(board);
    expect(conflicts).toEqual(
      expect.arrayContaining([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 2, col: 3 },
        { row: 5, col: 3 },
        { row: 6, col: 6 },
        { row: 7, col: 7 },
      ]),
    );
    expect(conflicts.length).toBe(6);
  });

  it("un conflicto desaparece al borrar una de las celdas implicadas", () => {
    let board = createEmptyBoard();
    board = place(board, { row: 0, col: 0 }, 5).board;
    board = place(board, { row: 0, col: 1 }, 5).board;
    board = place(board, { row: 2, col: 3 }, 7).board;
    board = place(board, { row: 5, col: 3 }, 7).board;

    board = clear(board, { row: 0, col: 1 });

    const conflicts = getConflicts(board);
    expect(conflicts).not.toEqual(expect.arrayContaining([{ row: 0, col: 0 }]));
    expect(conflicts).not.toEqual(expect.arrayContaining([{ row: 0, col: 1 }]));
    expect(conflicts).toEqual(
      expect.arrayContaining([
        { row: 2, col: 3 },
        { row: 5, col: 3 },
      ]),
    );
    expect(conflicts.length).toBe(2);
  });

  it("un conflicto desaparece al reemplazar el valor conflictivo", () => {
    let board = createEmptyBoard();
    board = place(board, { row: 0, col: 0 }, 5).board;
    board = place(board, { row: 0, col: 1 }, 5).board;
    board = place(board, { row: 2, col: 3 }, 7).board;
    board = place(board, { row: 5, col: 3 }, 7).board;

    board = place(board, { row: 0, col: 1 }, 2).board;

    const conflicts = getConflicts(board);
    expect(conflicts).not.toEqual(expect.arrayContaining([{ row: 0, col: 0 }]));
    expect(conflicts).not.toEqual(expect.arrayContaining([{ row: 0, col: 1 }]));
    expect(conflicts).toEqual(
      expect.arrayContaining([
        { row: 2, col: 3 },
        { row: 5, col: 3 },
      ]),
    );
    expect(conflicts.length).toBe(2);
  });
});
