import { describe, expect, it } from "vitest";
import { DIFFICULTY_LABELS } from "./difficulty";

describe("DIFFICULTY_LABELS", () => {
  it("tiene las tres etiquetas visibles esperadas", () => {
    expect(DIFFICULTY_LABELS.easy).toBe("Fácil");
    expect(DIFFICULTY_LABELS.medium).toBe("Medio");
    expect(DIFFICULTY_LABELS.hard).toBe("Difícil");
  });
});
