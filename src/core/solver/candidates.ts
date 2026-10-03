import type { Coord } from "../board/types";
import { peerCoords } from "../board/units";

export type SearchGrid = ReadonlyArray<ReadonlyArray<number | null>>;

export function getCandidates(grid: SearchGrid, cell: Coord): number[] {
  const used = new Set<number>();
  for (const peer of peerCoords(cell)) {
    const value = grid[peer.row][peer.col];
    if (value !== null) used.add(value);
  }

  const candidates: number[] = [];
  for (let value = 1; value <= 9; value++) {
    if (!used.has(value)) candidates.push(value);
  }
  return candidates;
}
