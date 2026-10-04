export type Rng = () => number;

let autoSeedCounter = 0;

export function normalizeSeed(seed: number): number {
  return seed >>> 0;
}

export function deriveAutoSeed(): number {
  autoSeedCounter += 1;
  return normalizeSeed(Date.now() + autoSeedCounter);
}

export function createRng(seed: number): Rng {
  let state = normalizeSeed(seed);

  return function mulberry32(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function nextInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  const range = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(rng() * range);
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
