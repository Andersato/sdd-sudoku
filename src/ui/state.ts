import { createBoardFromPuzzle } from "../core/board/create";
import type { Board } from "../core/board/types";
import type { Difficulty } from "../core/generator";

export type AppState =
  | { readonly screen: "start"; readonly status: "idle" }
  | {
      readonly screen: "start";
      readonly status: "generating";
      readonly difficulty: Difficulty;
    }
  | {
      readonly screen: "start";
      readonly status: "error";
      readonly difficulty: Difficulty;
      readonly message: string;
    }
  | {
      readonly screen: "game";
      readonly board: Board;
      readonly puzzleDifficulty: Difficulty;
      readonly selected: { readonly row: number; readonly col: number } | null;
    };

export function chooseDifficulty(state: AppState, difficulty: Difficulty): AppState {
  if (state.screen === "start" && state.status === "generating") {
    return state;
  }
  return { screen: "start", status: "generating", difficulty };
}

export function generationSucceeded(
  state: AppState,
  puzzle: ReadonlyArray<ReadonlyArray<number | null>>,
): AppState {
  if (state.screen !== "start" || state.status !== "generating") {
    return state;
  }
  const board = createBoardFromPuzzle(puzzle);
  return {
    screen: "game",
    board,
    puzzleDifficulty: state.difficulty,
    selected: null,
  };
}

export function generationFailed(state: AppState, message: string): AppState {
  if (state.screen !== "start" || state.status !== "generating") {
    return state;
  }
  return { screen: "start", status: "error", difficulty: state.difficulty, message };
}

export function retry(state: AppState): AppState {
  if (state.screen !== "start" || state.status !== "error") {
    return state;
  }
  return { screen: "start", status: "generating", difficulty: state.difficulty };
}

export function confirmNewGame(state: AppState): AppState {
  if (state.screen !== "game") {
    return state;
  }
  return { screen: "start", status: "idle" };
}
