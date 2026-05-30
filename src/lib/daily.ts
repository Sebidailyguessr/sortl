import { generateLevel, hashString, LevelConfig } from "./levels";

const LAUNCH_DATE = "2026-06-01";

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPuzzleNumber(dateKey?: string): number {
  const key = dateKey ?? getTodayKey();
  const launch = new Date(LAUNCH_DATE);
  const today = new Date(key);
  const diff = Math.floor((today.getTime() - launch.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

export function getDailyLevel(dateKey?: string): LevelConfig {
  const key = dateKey ?? getTodayKey();
  const seed = hashString(key);
  // Daily puzzles use the full 6-color, 7-tube config
  return generateLevel(seed, 200);
}
