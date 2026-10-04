import { describe, expect, it } from "vitest";
import {
  chooseDifficulty,
  confirmNewGame,
  generationFailed,
  generationSucceeded,
  retry,
  type AppState,
} from "./state";

const idle: AppState = { screen: "start", status: "idle" };

describe("chooseDifficulty", () => {
  it("pasa de idle a generating con la dificultad elegida", () => {
    const next = chooseDifficulty(idle, "easy");
    expect(next).toEqual({ screen: "start", status: "generating", difficulty: "easy" });
  });

  it("pasa de error a generating con la nueva dificultad", () => {
    const errorState: AppState = {
      screen: "start",
      status: "error",
      difficulty: "easy",
      message: "boom",
    };
    const next = chooseDifficulty(errorState, "hard");
    expect(next).toEqual({ screen: "start", status: "generating", difficulty: "hard" });
  });

  it("no tiene efecto si ya se está generando (dificultad distinta)", () => {
    const generating: AppState = { screen: "start", status: "generating", difficulty: "easy" };
    const next = chooseDifficulty(generating, "hard");
    expect(next).toBe(generating);
  });

  it("no tiene efecto si ya se está generando (misma dificultad)", () => {
    const generating: AppState = { screen: "start", status: "generating", difficulty: "easy" };
    const next = chooseDifficulty(generating, "easy");
    expect(next).toBe(generating);
  });
});

describe("generationSucceeded", () => {
  const generating: AppState = { screen: "start", status: "generating", difficulty: "medium" };
  const puzzle: (number | null)[][] = [
    [5, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
  ];

  it("pasa a la pantalla de juego con el tablero generado", () => {
    const next = generationSucceeded(generating, puzzle);
    expect(next.screen).toBe("game");
    if (next.screen === "game") {
      expect(next.puzzleDifficulty).toBe("medium");
      expect(next.selected).toBeNull();
    }
  });

  it("no tiene efecto si no se estaba generando", () => {
    const next = generationSucceeded(idle, puzzle);
    expect(next).toBe(idle);
  });

  it("marca fixed=true solo en las celdas no nulas del planteamiento", () => {
    const next = generationSucceeded(generating, puzzle);
    expect(next.screen).toBe("game");
    if (next.screen === "game") {
      expect(next.board[0][0]).toEqual({ value: 5, fixed: true });
      expect(next.board[0][1]).toEqual({ value: null, fixed: false });
      expect(next.board[8][8]).toEqual({ value: null, fixed: false });
    }
  });
});

describe("generationFailed", () => {
  const generating: AppState = { screen: "start", status: "generating", difficulty: "hard" };

  it("pasa a error con el mensaje y la dificultad que falló", () => {
    const next = generationFailed(generating, "algo salió mal");
    expect(next).toEqual({
      screen: "start",
      status: "error",
      difficulty: "hard",
      message: "algo salió mal",
    });
  });

  it("no tiene efecto si no se estaba generando", () => {
    const next = generationFailed(idle, "algo salió mal");
    expect(next).toBe(idle);
  });
});

describe("retry", () => {
  it("pasa de error a generating con la misma dificultad", () => {
    const errorState: AppState = {
      screen: "start",
      status: "error",
      difficulty: "easy",
      message: "boom",
    };
    const next = retry(errorState);
    expect(next).toEqual({ screen: "start", status: "generating", difficulty: "easy" });
  });

  it("no tiene efecto si no hay error", () => {
    const next = retry(idle);
    expect(next).toBe(idle);
  });
});

describe("confirmNewGame", () => {
  it("pasa de la pantalla de juego a idle", () => {
    const game: AppState = {
      screen: "game",
      board: [],
      puzzleDifficulty: "easy",
      selected: null,
    };
    const next = confirmNewGame(game);
    expect(next).toEqual({ screen: "start", status: "idle" });
  });

  it("no tiene efecto si no está en la pantalla de juego", () => {
    const next = confirmNewGame(idle);
    expect(next).toBe(idle);
  });
});
