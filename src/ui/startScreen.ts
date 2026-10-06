import type { Difficulty } from "../core/generator";
import { DIFFICULTY_LABELS } from "./difficulty";
import type { GeneratePuzzleAsync } from "./generatePuzzleAsync";
import {
  chooseDifficulty,
  generationFailed,
  generationSucceeded,
  retry,
  type AppState,
} from "./state";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export interface StartScreenContext {
  readonly dispatch: (next: AppState) => void;
  readonly generatePuzzleAsync: GeneratePuzzleAsync;
}

export type StartState = Extract<AppState, { screen: "start" }>;

function runGeneration(
  generatingState: Extract<StartState, { status: "generating" }>,
  ctx: StartScreenContext,
): void {
  ctx.dispatch(generatingState);
  ctx.generatePuzzleAsync({ difficulty: generatingState.difficulty }).then(
    (puzzle) => ctx.dispatch(generationSucceeded(generatingState, puzzle)),
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "No se pudo generar el sudoku. Inténtalo de nuevo.";
      ctx.dispatch(generationFailed(generatingState, message));
    },
  );
}

function handleChoose(state: StartState, difficulty: Difficulty, ctx: StartScreenContext): void {
  const next = chooseDifficulty(state, difficulty);
  if (next.screen === "start" && next.status === "generating") {
    runGeneration(next, ctx);
  }
}

function handleRetry(state: Extract<StartState, { status: "error" }>, ctx: StartScreenContext): void {
  const next = retry(state);
  if (next.screen === "start" && next.status === "generating") {
    runGeneration(next, ctx);
  }
}

export function renderStartScreen(
  container: HTMLElement,
  state: StartState,
  ctx: StartScreenContext,
): void {
  container.innerHTML = "";

  const screen = document.createElement("div");
  screen.setAttribute("data-screen", "start");

  const heading = document.createElement("h1");
  heading.textContent = "SDD Sudoku";
  screen.appendChild(heading);

  const difficultyList = document.createElement("div");
  difficultyList.setAttribute("data-testid", "difficulty-list");

  for (const difficulty of DIFFICULTIES) {
    const button = document.createElement("button");
    button.textContent = DIFFICULTY_LABELS[difficulty];
    button.setAttribute("data-difficulty", difficulty);
    button.setAttribute("data-variant", "primary");
    button.disabled = state.status === "generating";
    button.addEventListener("click", () => handleChoose(state, difficulty, ctx));
    difficultyList.appendChild(button);
  }
  screen.appendChild(difficultyList);

  if (state.status === "generating") {
    const notice = document.createElement("p");
    notice.setAttribute("role", "status");
    notice.textContent = "Generando...";
    screen.appendChild(notice);
  }

  if (state.status === "error") {
    const errorMessage = document.createElement("p");
    errorMessage.setAttribute("role", "alert");
    errorMessage.textContent = state.message;
    screen.appendChild(errorMessage);

    const retryButton = document.createElement("button");
    retryButton.textContent = "Reintentar";
    retryButton.setAttribute("data-variant", "primary");
    retryButton.addEventListener("click", () => handleRetry(state, ctx));
    screen.appendChild(retryButton);
  }

  container.appendChild(screen);
}
