export type TubeState = string[]; // array of color strings, index 0 = bottom

export interface LevelConfig {
  tubes: TubeState[];
  numColors: number;
  tubeCapacity: number;
}

// Seeded LCG random number generator
export class SeededRNG {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed >>> 0;
  }
  next(): number {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const TUBE_CAPACITY = 4;

export const TUBE_COLORS = [
  "#c45a3a", // terracotta
  "#d49a3a", // ochre
  "#7a8a5e", // sage
  "#6b4858", // plum
  "#4a7a8a", // teal
  "#8a6a3a", // tan
];

export const COLOR_NAMES: Record<string, string> = {
  "#c45a3a": "terracotta",
  "#d49a3a": "ochre",
  "#7a8a5e": "sage",
  "#6b4858": "plum",
  "#4a7a8a": "teal",
  "#8a6a3a": "tan",
};

function getLevelParams(level: number): { numTubes: number; numColors: number; emptyTubes: number } {
  if (level <= 10) return { numTubes: 4, numColors: 3, emptyTubes: 1 };
  if (level <= 30) return { numTubes: 5, numColors: 4, emptyTubes: 1 };
  if (level <= 60) return { numTubes: 6, numColors: 5, emptyTubes: 1 };
  return { numTubes: 7, numColors: 6, emptyTubes: 1 };
}

function isSolvable(tubes: TubeState[], capacity: number): boolean {
  const key = (t: TubeState[]) => t.map(tube => tube.join(",")).join("|");
  const initial = tubes.map(t => [...t]);
  const queue: TubeState[][] = [initial];
  const visited = new Set<string>([key(initial)]);

  let iterations = 0;
  while (queue.length > 0 && iterations < 50000) {
    iterations++;
    const state = queue.shift()!;

    if (isWonState(state, capacity)) return true;

    for (let from = 0; from < state.length; from++) {
      if (state[from].length === 0) continue;
      const topColor = state[from][state[from].length - 1];

      for (let to = 0; to < state.length; to++) {
        if (from === to) continue;
        const toTube = state[to];
        if (toTube.length >= capacity) continue;
        if (toTube.length > 0 && toTube[toTube.length - 1] !== topColor) continue;
        // Skip moves that don't make progress: moving full same-color tube to empty tube
        if (toTube.length === 0 && state[from].every(c => c === topColor)) continue;

        const next = state.map(t => [...t]);
        next[to].push(next[from].pop()!);
        const k = key(next);
        if (!visited.has(k)) {
          visited.add(k);
          queue.push(next);
        }
      }
    }
  }
  return false;
}

function isWonState(tubes: TubeState[], capacity: number): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== capacity) return false;
    if (!tube.every(c => c === tube[0])) return false;
  }
  return true;
}

export function generateLevel(seed: number, levelNumber?: number): LevelConfig {
  const params = levelNumber ? getLevelParams(levelNumber) : { numTubes: 7, numColors: 6, emptyTubes: 1 };
  const { numColors, emptyTubes } = params;
  const numTubes = numColors + emptyTubes;

  for (let attempt = 0; attempt < 20; attempt++) {
    const rng = new SeededRNG(seed + attempt);
    const colors = TUBE_COLORS.slice(0, numColors);

    // Create a pool: each color appears exactly TUBE_CAPACITY times
    const pool: string[] = [];
    for (const color of colors) {
      for (let i = 0; i < TUBE_CAPACITY; i++) pool.push(color);
    }

    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rng.nextInt(i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Fill color tubes (bottom to top)
    const tubes: TubeState[] = [];
    for (let i = 0; i < numColors; i++) {
      tubes.push(pool.slice(i * TUBE_CAPACITY, (i + 1) * TUBE_CAPACITY));
    }
    // Add empty tubes
    for (let i = 0; i < emptyTubes; i++) tubes.push([]);

    // Skip already-solved states
    if (isWonState(tubes, TUBE_CAPACITY)) continue;

    if (isSolvable(tubes, TUBE_CAPACITY)) {
      return { tubes, numColors, tubeCapacity: TUBE_CAPACITY };
    }
  }

  // Fallback: return a trivially solvable level (all same color per tube, one shuffled layer)
  const rng = new SeededRNG(seed);
  const colors = TUBE_COLORS.slice(0, numColors);
  const tubes: TubeState[] = colors.map(c => [c, c, c, c]);
  tubes.push([]);
  // Swap one layer to make it non-trivial
  const c0 = tubes[0][3];
  const c1 = tubes[1][3];
  tubes[0][3] = c1;
  tubes[1][3] = c0;
  return { tubes, numColors, tubeCapacity: TUBE_CAPACITY };
}
