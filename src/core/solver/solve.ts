import { BOARD_SIZE, type Board, type Coord } from "../board/types";
import { peerCoords } from "../board/units";
import { getCandidates, type SearchGrid } from "./candidates";
import type { Solution, SolveResult } from "./types";

function buildInitialGrid(board: Board): (number | null)[][] {
  return board.map((row) => row.map((cell) => (cell.fixed ? cell.value : null)));
}

function buildInitialDomains(grid: SearchGrid): (Set<number> | null)[][] {
  return grid.map((row, rowIndex) =>
    row.map((value, colIndex) =>
      value === null ? new Set(getCandidates(grid, { row: rowIndex, col: colIndex })) : null,
    ),
  );
}

function findEmptyCells(grid: SearchGrid): Coord[] {
  const cells: Coord[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (grid[row][col] === null) cells.push({ row, col });
    }
  }
  return cells;
}

function snapshotSolution(grid: SearchGrid): Solution {
  return grid.map((row) => row.map((value) => value as number));
}

export function solve(board: Board): SolveResult {
  const grid = buildInitialGrid(board);
  const domains = buildInitialDomains(grid);
  const emptyCells = findEmptyCells(grid);

  let firstSolution: Solution | null = null;
  let solutionsFound = 0;

  function selectCell(): Coord | null {
    let best: Coord | null = null;
    let bestSize = Number.POSITIVE_INFINITY;
    for (const cell of emptyCells) {
      if (grid[cell.row][cell.col] !== null) continue;
      const size = domains[cell.row][cell.col]!.size;
      if (size < bestSize) {
        best = cell;
        bestSize = size;
        if (size === 0) return best;
      }
    }
    return best;
  }

  function backtrack(): boolean {
    const cell = selectCell();

    if (cell === null) {
      solutionsFound++;
      if (firstSolution === null) {
        firstSolution = snapshotSolution(grid);
      }
      return solutionsFound >= 2;
    }

    const domain = domains[cell.row][cell.col]!;
    const candidates = [...domain].sort((a, b) => a - b);

    for (const value of candidates) {
      grid[cell.row][cell.col] = value;

      const removedFrom: Coord[] = [];
      for (const peer of peerCoords(cell)) {
        if (grid[peer.row][peer.col] === null) {
          const peerDomain = domains[peer.row][peer.col]!;
          if (peerDomain.has(value)) {
            peerDomain.delete(value);
            removedFrom.push(peer);
          }
        }
      }

      const shouldStop = backtrack();

      for (const peer of removedFrom) {
        domains[peer.row][peer.col]!.add(value);
      }
      grid[cell.row][cell.col] = null;

      if (shouldStop) return true;
    }
    return false;
  }

  backtrack();

  if (solutionsFound === 0) return { status: "no_solution" };
  if (solutionsFound === 1) return { status: "unique_solution", solution: firstSolution! };
  return { status: "multiple_solutions", solution: firstSolution! };
}
