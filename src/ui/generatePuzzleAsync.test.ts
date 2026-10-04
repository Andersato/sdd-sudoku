import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const generatePuzzleMock = vi.fn(() => [[1]]);

vi.mock("../core/generator", () => ({
  generatePuzzle: generatePuzzleMock,
}));

describe("defaultGeneratePuzzleAsync", () => {
  let rafCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    generatePuzzleMock.mockClear();
    rafCallbacks = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no llama a generatePuzzle hasta que se resuelven los dos requestAnimationFrame encadenados", async () => {
    const { defaultGeneratePuzzleAsync } = await import("./generatePuzzleAsync");

    const promise = defaultGeneratePuzzleAsync({ difficulty: "easy" });

    await Promise.resolve();
    expect(generatePuzzleMock).not.toHaveBeenCalled();
    expect(rafCallbacks).toHaveLength(1);

    rafCallbacks[0](0);
    await Promise.resolve();
    expect(generatePuzzleMock).not.toHaveBeenCalled();
    expect(rafCallbacks).toHaveLength(2);

    rafCallbacks[1](0);
    await promise;
    expect(generatePuzzleMock).toHaveBeenCalledTimes(1);
  });
});
