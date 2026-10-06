const SECONDS_PER_HOUR = 3600;

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
  }
  return `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export interface GameTimer {
  pause(): void;
  resume(): void;
  stop(): void;
  elapsedMs(): number;
  isStopped(): boolean;
}

export function createGameTimer(now: () => number): GameTimer {
  let accumulatedMs = 0;
  let runningSince: number | null = now();
  let stopped = false;

  function pause(): void {
    if (runningSince === null) return;
    accumulatedMs += now() - runningSince;
    runningSince = null;
  }

  return {
    pause,
    resume(): void {
      if (stopped || runningSince !== null) return;
      runningSince = now();
    },
    stop(): void {
      pause();
      stopped = true;
    },
    elapsedMs(): number {
      return runningSince === null ? accumulatedMs : accumulatedMs + (now() - runningSince);
    },
    isStopped(): boolean {
      return stopped;
    },
  };
}
