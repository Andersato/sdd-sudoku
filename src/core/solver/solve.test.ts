import { describe, expect, it } from "vitest";
import { createBoardFromPuzzle, createEmptyBoard } from "../board/create";
import { place } from "../board/mutate";
import { assertValidSolution } from "./solutionAssertions.test-helpers";
import { solve } from "./solve";

const UNIQUE_SOLUTION_PUZZLE: (number | null)[][] = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

const UNIQUE_SOLUTION: number[][] = [
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

const ARTO_INKALA_PUZZLE: (number | null)[][] = [
  [8, null, null, null, null, null, null, null, null],
  [null, null, 3, 6, null, null, null, null, null],
  [null, 7, null, null, 9, null, 2, null, null],
  [null, 5, null, null, null, 7, null, null, null],
  [null, null, null, null, 4, 5, 7, null, null],
  [null, null, null, 1, null, null, null, 3, null],
  [null, null, 1, null, null, null, null, 6, 8],
  [null, null, 8, 5, null, null, null, 1, null],
  [null, 9, null, null, null, null, 4, null, null],
];

const NO_SOLUTION_FIRST_CELL_PUZZLE: (number | null)[][] = [
  [null, 1, 2, 3, 4, 5, 6, 7, 8],
  [9, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
];

const NO_SOLUTION_LAST_CELL_PUZZLE: (number | null)[][] = [
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, 9],
  [1, 2, 3, 4, 5, 6, 7, 8, null],
];

describe("solve - sin solución", () => {
  it("devuelve no_solution cuando la celda (0,0) no admite ningún número", () => {
    const board = createBoardFromPuzzle(NO_SOLUTION_FIRST_CELL_PUZZLE);
    expect(solve(board)).toEqual({ status: "no_solution" });
  });

  it("devuelve no_solution en menos de 1 segundo cuando la celda (8,8) no admite ningún número", () => {
    const board = createBoardFromPuzzle(NO_SOLUTION_LAST_CELL_PUZZLE);

    const start = performance.now();
    const result = solve(board);
    const elapsedMs = performance.now() - start;

    expect(result).toEqual({ status: "no_solution" });
    expect(elapsedMs).toBeLessThan(1000);
  });
});

describe("solve - solución única", () => {
  it("resuelve el planteamiento de referencia con exactamente la solución esperada", () => {
    const board = createBoardFromPuzzle(UNIQUE_SOLUTION_PUZZLE);
    expect(solve(board)).toEqual({ status: "unique_solution", solution: UNIQUE_SOLUTION });
  });

  it("resuelve en menos de 1 segundo el sudoku de Arto Inkala (2012) con una solución válida", () => {
    const board = createBoardFromPuzzle(ARTO_INKALA_PUZZLE);

    const start = performance.now();
    const result = solve(board);
    const elapsedMs = performance.now() - start;

    expect(result.status).toBe("unique_solution");
    if (result.status === "unique_solution") {
      assertValidSolution(result.solution, board);
    }
    expect(elapsedMs).toBeLessThan(1000);
  });

  it("devuelve la misma solución para un tablero ya completo y válido", () => {
    const board = createBoardFromPuzzle(UNIQUE_SOLUTION);
    expect(solve(board)).toEqual({ status: "unique_solution", solution: UNIQUE_SOLUTION });
  });
});

describe("solve - múltiples soluciones", () => {
  it("devuelve multiple_solutions con una solución válida para el tablero vacío", () => {
    const board = createEmptyBoard();
    const result = solve(board);
    expect(result.status).toBe("multiple_solutions");
    if (result.status === "multiple_solutions") {
      assertValidSolution(result.solution, board);
    }
  });

  it("devuelve multiple_solutions con una solución válida para un planteamiento con una sola pista", () => {
    const puzzle: (number | null)[][] = Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
    puzzle[0][0] = 1;
    const board = createBoardFromPuzzle(puzzle);

    const result = solve(board);

    expect(result.status).toBe("multiple_solutions");
    if (result.status === "multiple_solutions") {
      assertValidSolution(result.solution, board);
    }
  });

  it("es determinista: resolver dos veces el mismo tablero vacío da la misma solución", () => {
    const board = createEmptyBoard();
    const first = solve(board);
    const second = solve(board);
    expect(first).toEqual(second);
  });

  it("es determinista: resolver dos veces el mismo planteamiento con una sola pista da la misma solución", () => {
    const puzzle: (number | null)[][] = Array.from({ length: 9 }, () => Array<number | null>(9).fill(null));
    puzzle[0][0] = 1;
    const board = createBoardFromPuzzle(puzzle);

    const first = solve(board);
    const second = solve(board);

    expect(first).toEqual(second);
  });
});

describe("solve - ignora la partida en curso del jugador", () => {
  it("ignora valores del jugador que entran en conflicto entre sí", () => {
    let board = createBoardFromPuzzle(UNIQUE_SOLUTION_PUZZLE);
    board = place(board, { row: 0, col: 2 }, 1).board;
    board = place(board, { row: 0, col: 3 }, 1).board; // repite 1 en la misma fila

    expect(solve(board)).toEqual({ status: "unique_solution", solution: UNIQUE_SOLUTION });
  });

  it("ignora un valor del jugador que no conflictúa pero no coincide con la solución", () => {
    const board = place(createBoardFromPuzzle(UNIQUE_SOLUTION_PUZZLE), { row: 0, col: 2 }, 1).board;

    expect(solve(board)).toEqual({ status: "unique_solution", solution: UNIQUE_SOLUTION });
  });
});

describe("solve - no modifica el tablero de entrada", () => {
  it("deja intactos los valores y la fijeza de cada celda tras resolver", () => {
    const board = createBoardFromPuzzle(UNIQUE_SOLUTION_PUZZLE);
    const snapshot = board.map((row) => row.map((cell) => ({ ...cell })));

    solve(board);

    expect(board.map((row) => row.map((cell) => ({ ...cell })))).toEqual(snapshot);
  });
});
