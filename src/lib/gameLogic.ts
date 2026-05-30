import { TubeState } from "./levels";

export interface GameState {
  tubes: TubeState[];
  tubeCapacity: number;
  moves: number;
  history: TubeState[][];
  won: boolean;
  stuck: boolean;
}

export function getTopLayer(tube: TubeState): string | null {
  return tube.length > 0 ? tube[tube.length - 1] : null;
}

export function isValidMove(tubes: TubeState[], from: number, to: number, capacity: number): boolean {
  if (from === to) return false;
  const src = tubes[from];
  const dst = tubes[to];
  if (src.length === 0) return false;
  if (dst.length >= capacity) return false;
  const srcTop = src[src.length - 1];
  if (dst.length > 0 && dst[dst.length - 1] !== srcTop) return false;
  return true;
}

export function applyMove(tubes: TubeState[], from: number, to: number): TubeState[] {
  const next = tubes.map(t => [...t]);
  next[to].push(next[from].pop()!);
  return next;
}

export function isWon(tubes: TubeState[], capacity: number): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== capacity) return false;
    if (!tube.every(c => c === tube[0])) return false;
  }
  return true;
}

export function isStuck(tubes: TubeState[], capacity: number): boolean {
  for (let from = 0; from < tubes.length; from++) {
    for (let to = 0; to < tubes.length; to++) {
      if (isValidMove(tubes, from, to, capacity)) return false;
    }
  }
  return true;
}

export function calcPar(tubes: TubeState[], capacity: number): number {
  // Greedy estimate: count misplaced layers
  let misplaced = 0;
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    const dominant = [...tube].sort((a, b) =>
      tube.filter(x => x === b).length - tube.filter(x => x === a).length
    )[0];
    misplaced += tube.filter(c => c !== dominant).length;
  }
  return Math.max(misplaced, Math.ceil(misplaced * 1.5));
}

export function getScoreLabel(moves: number, par: number, stuck: boolean): string {
  if (stuck) return "UNSORTED";
  if (moves <= par) return "FLAWLESS SORT";
  if (moves <= par + 3) return "CLEAN SORT";
  if (moves <= par + 8) return "DECENT SORT";
  return "MESSY SORT";
}

export function makeInitialState(tubes: TubeState[], tubeCapacity: number): GameState {
  return { tubes, tubeCapacity, moves: 0, history: [], won: false, stuck: false };
}

export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const history = [...state.history];
  const tubes = history.pop()!;
  return { ...state, tubes, moves: Math.max(0, state.moves - 1), history, won: false, stuck: false };
}
