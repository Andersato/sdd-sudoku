import { getConflicts } from "./conflicts";
import type { Board } from "./types";

export function isSolved(board: Board): boolean {
  const allFilled = board.every((row) => row.every((cell) => cell.value !== null));
  return allFilled && getConflicts(board).length === 0;
}
