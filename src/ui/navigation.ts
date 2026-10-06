import { isSolved } from "../core/board/solved";
import { BOARD_SIZE, type Board, type Coord } from "../core/board/types";

export type ArrowKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export function nextSelection(current: Coord | null, key: ArrowKey): Coord {
  if (current === null) {
    return { row: 0, col: 0 };
  }
  switch (key) {
    case "ArrowUp":
      return current.row > 0 ? { row: current.row - 1, col: current.col } : current;
    case "ArrowDown":
      return current.row < BOARD_SIZE - 1 ? { row: current.row + 1, col: current.col } : current;
    case "ArrowLeft":
      return current.col > 0 ? { row: current.row, col: current.col - 1 } : current;
    case "ArrowRight":
      return current.col < BOARD_SIZE - 1 ? { row: current.row, col: current.col + 1 } : current;
  }
}

export function shouldConfirmNewGame(board: Board): boolean {
  if (isSolved(board)) {
    return false;
  }
  return board.some((row) => row.some((cell) => !cell.fixed && cell.value !== null));
}
