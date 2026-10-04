import { describe, expect, it } from "vitest";
import { BOARD_SIZE } from "../board/types";
import { allUnits } from "../board/units";
import { createRng } from "./rng";
import { fillGrid, type Grid } from "./fillGrid";

function assertCompleteValidGrid(grid: Grid): void {
  expect(grid.length).toBe(BOARD_SIZE);
  for (const row of grid) {
    expect(row.length).toBe(BOARD_SIZE);
  }

  for (const unit of allUnits()) {
    const seen = new Set<number>();
    for (const { row, col } of unit) {
      const value = grid[row][col];
      expect(seen.has(value)).toBe(false);
      seen.add(value);
    }
    for (let value = 1; value <= 9; value++) {
      expect(seen.has(value)).toBe(true);
    }
  }
}

describe("fillGrid", () => {
  it("produce una rejilla completa de 81 celdas sin repetir 1-9 en ninguna fila, columna o cuadro 3x3", () => {
    const grid = fillGrid(createRng(1));
    assertCompleteValidGrid(grid);
  });

  it("con la misma semilla produce siempre la misma rejilla completa", () => {
    expect(fillGrid(createRng(7))).toEqual(fillGrid(createRng(7)));
  });

  it("con semillas distintas produce rejillas distintas", () => {
    expect(fillGrid(createRng(7))).not.toEqual(fillGrid(createRng(8)));
  });
});
