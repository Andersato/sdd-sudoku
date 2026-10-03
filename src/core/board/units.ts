import { BOARD_SIZE, BOX_SIZE, type Coord } from "./types";

export function rowCoords(row: number): Coord[] {
  const coords: Coord[] = [];
  for (let col = 0; col < BOARD_SIZE; col++) {
    coords.push({ row, col });
  }
  return coords;
}

export function colCoords(col: number): Coord[] {
  const coords: Coord[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    coords.push({ row, col });
  }
  return coords;
}

export function boxCoords(cell: Coord): Coord[] {
  const boxRowStart = Math.floor(cell.row / BOX_SIZE) * BOX_SIZE;
  const boxColStart = Math.floor(cell.col / BOX_SIZE) * BOX_SIZE;
  const coords: Coord[] = [];
  for (let row = boxRowStart; row < boxRowStart + BOX_SIZE; row++) {
    for (let col = boxColStart; col < boxColStart + BOX_SIZE; col++) {
      coords.push({ row, col });
    }
  }
  return coords;
}

export function allUnits(): Coord[][] {
  const units: Coord[][] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    units.push(rowCoords(i));
    units.push(colCoords(i));
  }
  for (let boxRow = 0; boxRow < BOARD_SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < BOARD_SIZE; boxCol += BOX_SIZE) {
      units.push(boxCoords({ row: boxRow, col: boxCol }));
    }
  }
  return units;
}

export function peerCoords(cell: Coord): Coord[] {
  const seen = new Set<string>();
  const peers: Coord[] = [];
  const candidates = [
    ...rowCoords(cell.row),
    ...colCoords(cell.col),
    ...boxCoords(cell),
  ];
  for (const candidate of candidates) {
    if (candidate.row === cell.row && candidate.col === cell.col) continue;
    const key = `${candidate.row},${candidate.col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    peers.push(candidate);
  }
  return peers;
}
