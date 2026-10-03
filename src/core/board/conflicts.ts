import { assertInBounds, type Board, type Coord } from "./types";
import { allUnits, peerCoords } from "./units";

export function getCellConflicts(board: Board, cell: Coord): Coord[] {
  assertInBounds(cell);
  const value = board[cell.row][cell.col].value;
  if (value === null) return [];

  return peerCoords(cell).filter((peer) => board[peer.row][peer.col].value === value);
}

function coordKey(coord: Coord): string {
  return `${coord.row},${coord.col}`;
}

export function getConflicts(board: Board): Coord[] {
  const conflicting = new Map<string, Coord>();

  for (const unit of allUnits()) {
    const seenByValue = new Map<number, Coord[]>();
    for (const coord of unit) {
      const value = board[coord.row][coord.col].value;
      if (value === null) continue;
      const existing = seenByValue.get(value) ?? [];
      existing.push(coord);
      seenByValue.set(value, existing);
    }
    for (const coords of seenByValue.values()) {
      if (coords.length > 1) {
        for (const coord of coords) {
          conflicting.set(coordKey(coord), coord);
        }
      }
    }
  }

  return [...conflicting.values()];
}
