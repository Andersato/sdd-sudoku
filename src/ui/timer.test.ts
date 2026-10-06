import { describe, expect, it } from "vitest";
import { createGameTimer, formatElapsed } from "./timer";

describe("formatElapsed", () => {
  it.each([
    [0, "00:00"],
    [75_000, "01:15"],
    [59_900, "00:59"],
    [3_599_000, "59:59"],
    [3_725_000, "1:02:05"],
    [36_000_000, "10:00:00"],
  ])("%i ms → %s", (ms, expected) => {
    expect(formatElapsed(ms)).toBe(expected);
  });
});

function fakeClock() {
  let current = 1_000;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe("createGameTimer", () => {
  it("empieza a cero y avanza con el reloj", () => {
    const clock = fakeClock();
    const timer = createGameTimer(clock.now);
    expect(timer.elapsedMs()).toBe(0);
    clock.advance(75_000);
    expect(timer.elapsedMs()).toBe(75_000);
  });

  it("pausado no avanza", () => {
    const clock = fakeClock();
    const timer = createGameTimer(clock.now);
    clock.advance(40_000);
    timer.pause();
    clock.advance(30_000);
    expect(timer.elapsedMs()).toBe(40_000);
    timer.resume();
    clock.advance(5_000);
    expect(timer.elapsedMs()).toBe(45_000);
  });

  it("conserva la fracción de segundo al pausar", () => {
    const clock = fakeClock();
    const timer = createGameTimer(clock.now);
    clock.advance(40_700);
    timer.pause();
    clock.advance(10_000);
    timer.resume();
    expect(timer.elapsedMs()).toBe(40_700);
  });

  it("stop() congela el valor y resume() posterior no lo reanuda", () => {
    const clock = fakeClock();
    const timer = createGameTimer(clock.now);
    clock.advance(754_000);
    timer.stop();
    expect(timer.isStopped()).toBe(true);
    clock.advance(10_000);
    timer.resume();
    clock.advance(10_000);
    expect(timer.elapsedMs()).toBe(754_000);
  });

  it("pausar o reanudar dos veces seguidas no altera el valor", () => {
    const clock = fakeClock();
    const timer = createGameTimer(clock.now);
    clock.advance(10_000);
    timer.pause();
    timer.pause();
    clock.advance(5_000);
    expect(timer.elapsedMs()).toBe(10_000);
    timer.resume();
    clock.advance(2_000);
    timer.resume();
    clock.advance(3_000);
    expect(timer.elapsedMs()).toBe(15_000);
  });
});
