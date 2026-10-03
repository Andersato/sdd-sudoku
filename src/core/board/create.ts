import { BOARD_SIZE, SudokuBoardError, type Board, type Cell } from "./types";
import { allUnits } from "./units";

export function createEmptyBoard(): Board {
  const rows: Cell[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const cells: Cell[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      cells.push({ value: null, fixed: false });
    }
    rows.push(cells);
  }
  return rows;
}

function normalizePuzzleCell(raw: unknown): number | null {
  if (raw === null || raw === 0) return null;
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1 || raw > 9) {
    throw new SudokuBoardError(
      "invalid_puzzle",
      `Valor de planteamiento inválido: ${JSON.stringify(raw)}. Debe ser null, 0, o un entero entre 1 y 9.`,
    );
  }
  return raw;
}

function validateNoDuplicates(board: Board): void {
  for (const unit of allUnits()) {
    const seen = new Set<number>();
    for (const { row, col } of unit) {
      const value = board[row][col].value;
      if (value === null) continue;
      if (seen.has(value)) {
        throw new SudokuBoardError(
          "invalid_puzzle",
          `El planteamiento repite el valor ${value} dentro de una misma fila, columna o cuadro 3x3.`,
        );
      }
      seen.add(value);
    }
  }
}

export function createBoardFromPuzzle(puzzle: ReadonlyArray<ReadonlyArray<number | null>>): Board {
  if (!Array.isArray(puzzle) || puzzle.length !== BOARD_SIZE) {
    throw new SudokuBoardError(
      "invalid_puzzle",
      `El planteamiento debe tener ${BOARD_SIZE} filas.`,
    );
  }

  const rows: Cell[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rawRow = puzzle[row];
    if (!Array.isArray(rawRow) || rawRow.length !== BOARD_SIZE) {
      throw new SudokuBoardError(
        "invalid_puzzle",
        `La fila ${row} del planteamiento debe tener ${BOARD_SIZE} columnas.`,
      );
    }
    const cells: Cell[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = normalizePuzzleCell(rawRow[col]);
      cells.push({ value, fixed: value !== null });
    }
    rows.push(cells);
  }

  validateNoDuplicates(rows);

  return rows;
}
