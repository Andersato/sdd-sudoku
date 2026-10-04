import { generatePuzzle } from "../core/generator";
import type { GeneratorOptions } from "../core/generator";

export type GeneratePuzzleAsync = (
  options: GeneratorOptions,
) => Promise<(number | null)[][]>;

export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export async function defaultGeneratePuzzleAsync(
  options: GeneratorOptions,
): Promise<(number | null)[][]> {
  await waitForNextPaint();
  return generatePuzzle(options);
}
