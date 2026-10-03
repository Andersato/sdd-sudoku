export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;

export interface Coord {
  readonly row: number;
  readonly col: number;
}

export interface Cell {
  readonly value: number | null;
  readonly fixed: boolean;
}

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

export type SudokuBoardErrorCode =
  | "invalid_puzzle"
  | "fixed_cell"
  | "invalid_value"
  | "out_of_bounds";

export class SudokuBoardError extends Error {
  readonly code: SudokuBoardErrorCode;

  constructor(code: SudokuBoardErrorCode, message: string) {
    super(message);
    this.name = "SudokuBoardError";
    this.code = code;
  }
}

export function assertInBounds(cell: Coord): void {
  if (
    !Number.isInteger(cell.row) ||
    !Number.isInteger(cell.col) ||
    cell.row < 0 ||
    cell.row >= BOARD_SIZE ||
    cell.col < 0 ||
    cell.col >= BOARD_SIZE
  ) {
    throw new SudokuBoardError(
      "out_of_bounds",
      `Coordenadas fuera de rango: fila ${cell.row}, columna ${cell.col}. Deben estar entre 0 y ${BOARD_SIZE - 1}.`,
    );
  }
}
