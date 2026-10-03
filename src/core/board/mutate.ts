import { assertInBounds, SudokuBoardError, type Board, type Cell, type Coord } from "./types";
import { getCellConflicts } from "./conflicts";

export interface PlaceResult {
  readonly board: Board;
  readonly conflicts: ReadonlyArray<Coord>;
}

function assertEditable(board: Board, cell: Coord): void {
  if (board[cell.row][cell.col].fixed) {
    throw new SudokuBoardError(
      "fixed_cell",
      `La celda (${cell.row}, ${cell.col}) es fija y no se puede modificar.`,
    );
  }
}

function withCell(board: Board, cell: Coord, newCell: Cell): Board {
  return board.map((row, rowIndex) =>
    rowIndex === cell.row
      ? row.map((existingCell, colIndex) => (colIndex === cell.col ? newCell : existingCell))
      : row,
  );
}

export function place(board: Board, cell: Coord, value: unknown): PlaceResult {
  assertInBounds(cell);
  assertEditable(board, cell);

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 9) {
    throw new SudokuBoardError(
      "invalid_value",
      `Valor inválido: ${JSON.stringify(value)}. Debe ser un entero entre 1 y 9.`,
    );
  }

  const newBoard = withCell(board, cell, { value, fixed: false });
  const conflicts = getCellConflicts(newBoard, cell);

  return { board: newBoard, conflicts };
}

export function clear(board: Board, cell: Coord): Board {
  assertInBounds(cell);
  assertEditable(board, cell);

  return withCell(board, cell, { value: null, fixed: false });
}
