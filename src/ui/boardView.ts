import { clear, place } from "../core/board/mutate";
import { BOARD_SIZE, type Board, type Cell, type Coord } from "../core/board/types";
import { nextSelection, shouldConfirmNewGame, type ArrowKey } from "./navigation";
import { renderNumberPanel } from "./numberPanel";
import { confirmNewGame, type AppState } from "./state";

const CONFIRM_NEW_GAME_MESSAGE =
  "Hay una partida en curso. Si empiezas una nueva, perderás lo que has escrito. ¿Quieres continuar?";

export type GameState = Extract<AppState, { screen: "game" }>;

export interface GameScreenContext {
  readonly dispatch: (next: AppState) => void;
}

const ARROW_KEYS: readonly ArrowKey[] = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function isArrowKey(key: string): key is ArrowKey {
  return (ARROW_KEYS as readonly string[]).includes(key);
}

export function handleDigit(board: Board, selected: Coord | null, value: number): Board {
  if (selected === null || board[selected.row][selected.col].fixed) {
    return board;
  }
  return place(board, selected, value).board;
}

export function handleErase(board: Board, selected: Coord | null): Board {
  if (selected === null || board[selected.row][selected.col].fixed) {
    return board;
  }
  return clear(board, selected);
}

export function renderGameScreen(
  container: HTMLElement,
  state: GameState,
  ctx: GameScreenContext,
): void {
  container.innerHTML = "";

  const screen = document.createElement("div");
  screen.setAttribute("data-screen", "game");

  const grid = document.createElement("div");
  grid.setAttribute("role", "grid");
  grid.setAttribute("tabindex", "0");

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell: Cell = state.board[row][col];
      const cellEl = document.createElement("div");
      cellEl.setAttribute("role", "gridcell");
      cellEl.setAttribute("data-row", String(row));
      cellEl.setAttribute("data-col", String(col));
      cellEl.setAttribute("data-fixed", String(cell.fixed));
      const isSelected = state.selected?.row === row && state.selected?.col === col;
      cellEl.setAttribute("aria-selected", String(isSelected));
      cellEl.textContent = cell.value === null ? "" : String(cell.value);
      cellEl.addEventListener("click", () => {
        ctx.dispatch({ ...state, selected: { row, col } });
      });
      grid.appendChild(cellEl);
    }
  }

  function applyDigit(value: number): void {
    const nextBoard = handleDigit(state.board, state.selected, value);
    if (nextBoard !== state.board) {
      ctx.dispatch({ ...state, board: nextBoard });
    }
  }

  function applyErase(): void {
    const nextBoard = handleErase(state.board, state.selected);
    if (nextBoard !== state.board) {
      ctx.dispatch({ ...state, board: nextBoard });
    }
  }

  grid.addEventListener("keydown", (event) => {
    if (isArrowKey(event.key)) {
      event.preventDefault();
      const nextSelected = nextSelection(state.selected, event.key);
      ctx.dispatch({ ...state, selected: nextSelected });
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      applyErase();
      return;
    }
    if (event.key.length === 1) {
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
        applyDigit(digit);
      }
    }
  });

  const newGameButton = document.createElement("button");
  newGameButton.textContent = "Nueva partida";
  newGameButton.setAttribute("data-variant", "secondary");
  newGameButton.addEventListener("click", () => {
    if (shouldConfirmNewGame(state.board) && !window.confirm(CONFIRM_NEW_GAME_MESSAGE)) {
      return;
    }
    ctx.dispatch(confirmNewGame(state));
  });

  screen.appendChild(grid);
  renderNumberPanel(screen, { onDigit: applyDigit, onErase: applyErase });
  screen.appendChild(newGameButton);
  container.appendChild(screen);
  grid.focus();
}
