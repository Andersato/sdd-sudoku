import type { Board } from "../board/types";
import { allUnits } from "../board/units";
import type { Solution } from "./types";

export function assertValidSolution(solution: Solution, originalBoard: Board): void {
  for (let row = 0; row < originalBoard.length; row++) {
    for (let col = 0; col < originalBoard[row].length; col++) {
      const cell = originalBoard[row][col];
      if (cell.fixed && solution[row][col] !== cell.value) {
        throw new Error(
          `La celda fija (${row}, ${col}) debía conservar el valor ${cell.value}, pero la solución tiene ${solution[row][col]}.`,
        );
      }
    }
  }

  for (const unit of allUnits()) {
    const seen = new Set<number>();
    for (const { row, col } of unit) {
      const value = solution[row][col];
      if (seen.has(value)) {
        throw new Error(`La solución repite el valor ${value} en la celda (${row}, ${col}).`);
      }
      seen.add(value);
    }
    for (let value = 1; value <= 9; value++) {
      if (!seen.has(value)) {
        throw new Error(`Una fila, columna o cuadro 3x3 de la solución no contiene el valor ${value}.`);
      }
    }
  }
}
