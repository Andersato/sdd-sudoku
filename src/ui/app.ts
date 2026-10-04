import { renderGameScreen, type GameScreenContext } from "./boardView";
import { defaultGeneratePuzzleAsync, type GeneratePuzzleAsync } from "./generatePuzzleAsync";
import { renderStartScreen, type StartScreenContext } from "./startScreen";
import type { AppState } from "./state";

export interface AppDeps {
  readonly generatePuzzleAsync: GeneratePuzzleAsync;
}

export function mount(
  container: HTMLElement,
  deps: AppDeps = { generatePuzzleAsync: defaultGeneratePuzzleAsync },
): void {
  let state: AppState = { screen: "start", status: "idle" };

  function dispatch(next: AppState): void {
    state = next;
    render();
  }

  function render(): void {
    if (state.screen === "start") {
      const ctx: StartScreenContext = { dispatch, generatePuzzleAsync: deps.generatePuzzleAsync };
      renderStartScreen(container, state, ctx);
      return;
    }

    const ctx: GameScreenContext = { dispatch };
    renderGameScreen(container, state, ctx);
  }

  render();
}
