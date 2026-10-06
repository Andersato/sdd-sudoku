import { isSolved } from "../core/board/solved";
import { renderGameScreen, type GameScreenContext } from "./boardView";
import { defaultGeneratePuzzleAsync, type GeneratePuzzleAsync } from "./generatePuzzleAsync";
import { renderStartScreen, type StartScreenContext } from "./startScreen";
import type { AppState } from "./state";
import { createGameTimer, formatElapsed, type GameTimer } from "./timer";

const TIMER_TICK_MS = 250;

export interface PageVisibility {
  isHidden(): boolean;
  /** Llama a `onChange` cada vez que cambia la visibilidad; devuelve la función para cancelar. */
  subscribe(onChange: () => void): () => void;
}

export interface AppDeps {
  readonly generatePuzzleAsync: GeneratePuzzleAsync;
  readonly now?: () => number;
  readonly visibility?: PageVisibility;
}

const documentVisibility: PageVisibility = {
  isHidden: () => document.visibilityState === "hidden",
  subscribe(onChange) {
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  },
};

interface ActiveTimer {
  readonly timer: GameTimer;
  dispose(): void;
}

export function mount(
  container: HTMLElement,
  deps: AppDeps = { generatePuzzleAsync: defaultGeneratePuzzleAsync },
): void {
  const now = deps.now ?? (() => performance.now());
  const visibility = deps.visibility ?? documentVisibility;

  let state: AppState = { screen: "start", status: "idle" };
  let active: ActiveTimer | null = null;

  function startTimer(): ActiveTimer {
    const timer = createGameTimer(now);
    if (visibility.isHidden()) {
      timer.pause();
    }
    const unsubscribe = visibility.subscribe(() => {
      if (visibility.isHidden()) {
        timer.pause();
      } else {
        timer.resume();
      }
    });
    // El elemento se busca en cada tic: cada repintado crea uno nuevo (D5).
    const interval = setInterval(() => {
      const display = container.querySelector('[data-testid="timer"]');
      if (display) {
        display.textContent = formatElapsed(timer.elapsedMs());
      }
    }, TIMER_TICK_MS);
    return {
      timer,
      dispose() {
        clearInterval(interval);
        unsubscribe();
      },
    };
  }

  function dispatch(next: AppState): void {
    if (next.screen === "game") {
      if (state.screen !== "game") {
        active?.dispose();
        active = startTimer();
      }
      if (isSolved(next.board)) {
        active?.timer.stop();
      }
    } else if (active) {
      active.dispose();
      active = null;
    }
    state = next;
    render();
  }

  function render(): void {
    if (state.screen === "start") {
      const ctx: StartScreenContext = { dispatch, generatePuzzleAsync: deps.generatePuzzleAsync };
      renderStartScreen(container, state, ctx);
      return;
    }

    const timer = active?.timer;
    const ctx: GameScreenContext = { dispatch, elapsedMs: () => timer?.elapsedMs() ?? 0 };
    renderGameScreen(container, state, ctx);
  }

  render();
}
