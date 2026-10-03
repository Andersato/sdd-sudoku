import { describe, expect, it } from "vitest";
import { getCandidates, type SearchGrid } from "./candidates";

function emptyGrid(): (number | null)[][] {
  return Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
}

describe("getCandidates", () => {
  it("devuelve del 1 al 9 para una celda sin restricciones", () => {
    const grid = emptyGrid();
    const candidates = getCandidates(grid, { row: 4, col: 4 });
    expect(candidates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("excluye los valores ya presentes en la fila, columna y cuadro de la celda", () => {
    const grid = emptyGrid();
    grid[0][1] = 2; // misma fila
    grid[1][0] = 3; // misma columna
    grid[1][1] = 5; // mismo cuadro 3x3

    const candidates = getCandidates(grid, { row: 0, col: 0 });

    expect(candidates).toEqual([1, 4, 6, 7, 8, 9]);
  });

  it("no se ve afectada por valores fuera de la fila, columna y cuadro de la celda", () => {
    const grid = emptyGrid();
    grid[8][8] = 7; // ni misma fila, columna ni cuadro que (0,0)

    const candidates = getCandidates(grid, { row: 0, col: 0 });

    expect(candidates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("funciona igual sobre valores fijos y asignados durante la búsqueda", () => {
    const grid: SearchGrid = [
      [5, null, null, null, null, null, null, null, null],
      [null, 3, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null],
    ];

    const candidates = getCandidates(grid, { row: 0, col: 2 });

    expect(candidates).toEqual([1, 2, 4, 6, 7, 8, 9]);
  });
});
