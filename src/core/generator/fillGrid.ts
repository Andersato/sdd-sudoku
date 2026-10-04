import { BOARD_SIZE, type Coord } from "../board/types";
import { getCandidates, type SearchGrid } from "../solver/candidates";
import { shuffle, type Rng } from "./rng";

export type Grid = number[][];

function findMrvCell(grid: SearchGrid): { cell: Coord; candidates: number[] } | null {
  let best: { cell: Coord; candidates: number[] } | null = null;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (grid[row][col] !== null) continue;
      const candidates = getCandidates(grid, { row, col });
      if (best === null || candidates.length < best.candidates.length) {
        best = { cell: { row, col }, candidates };
        if (candidates.length === 0) return best;
      }
    }
  }

  return best;
}

export function fillGrid(rng: Rng): Grid {
  const grid: (number | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array<number | null>(BOARD_SIZE).fill(null),
  );

  function backtrack(): boolean {
    const next = findMrvCell(grid);
    if (next === null) return true;

    const { cell, candidates } = next;
    for (const value of shuffle(rng, candidates)) {
      grid[cell.row][cell.col] = value;
      if (backtrack()) return true;
      grid[cell.row][cell.col] = null;
    }
    return false;
  }

  const solved = backtrack();
  if (!solved) {
    throw new Error(
      "No se pudo rellenar una rejilla completa de sudoku válida; esto no debería ocurrir.",
    );
  }

  return grid.map((row) => row.map((value) => value as number));
}
