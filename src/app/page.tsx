"use client";
import { useEffect, useState } from "react";
import StoopNav from "./components/StoopNav";
import StoopFooter from "./components/StoopFooter";
import GameBoard from "./components/GameBoard";
import Sidebar from "./components/Sidebar";

type Mode = "daily" | "levels";

const MAX_LEVELS = 300;

function findNextUnsolvedLevel(from: number): number {
  for (let n = from; n <= MAX_LEVELS; n++) {
    if (localStorage.getItem(`sl-level-done-${n}`) !== "true") return n;
  }
  return MAX_LEVELS; // all done — stay at last
}

export default function Home() {
  const [mode, setMode]               = useState<Mode>("daily");
  const [currentLevel, setCurrentLevel] = useState(1);

  // ── Hydrate from localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      // Mode
      const savedMode = localStorage.getItem("sl-mode") as Mode | null;
      const activeMode: Mode = (savedMode === "daily" || savedMode === "levels")
        ? savedMode : "daily";
      setMode(activeMode);

      // Level — ensure key exists
      let savedLevel = Number(localStorage.getItem("sl-current-level") || 0);
      if (savedLevel < 1) savedLevel = 1;

      // If opening in levels mode, skip already-completed levels
      if (activeMode === "levels") {
        savedLevel = findNextUnsolvedLevel(savedLevel);
      }

      setCurrentLevel(savedLevel);
      localStorage.setItem("sl-current-level", String(savedLevel));
    } catch {}
  }, []);

  // ── Mode toggle ──────────────────────────────────────────────────────────
  function handleModeChange(m: Mode) {
    setMode(m);
    try {
      localStorage.setItem("sl-mode", m);
      if (m === "levels") {
        // Jump to first unsolved level if current is already done
        const next = findNextUnsolvedLevel(currentLevel);
        if (next !== currentLevel) {
          setCurrentLevel(next);
          localStorage.setItem("sl-current-level", String(next));
        }
      }
    } catch {}
  }

  // ── Level completion (called from GameBoard) ─────────────────────────────
  function handleLevelComplete(level: number, moves: number) {
    try {
      const alreadyDone = localStorage.getItem(`sl-level-done-${level}`) === "true";
      localStorage.setItem(`sl-level-done-${level}`, "true");
      // Best score — always update if improved
      const best = localStorage.getItem(`sl-best-${level}`);
      if (!best || moves < Number(best)) {
        localStorage.setItem(`sl-best-${level}`, String(moves));
      }
      // Total solved — only count once per level
      if (!alreadyDone) {
        const solved = Number(localStorage.getItem("sl-total-solved") || 0);
        localStorage.setItem("sl-total-solved", String(solved + 1));
      }
    } catch {}
  }

  // ── Next level — skip already-completed ──────────────────────────────────
  function handleNextLevel() {
    try {
      const next = findNextUnsolvedLevel(currentLevel + 1);
      setCurrentLevel(next);
      localStorage.setItem("sl-current-level", String(next));
    } catch {}
  }

  function handleSelectLevel(n: number) {
    setCurrentLevel(n);
    try { localStorage.setItem("sl-current-level", String(n)); } catch {}
  }

  return (
    <>
      <StoopNav />
      <main className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full px-4 gap-6 pt-6 pb-12">
        <div className="flex-1 min-w-0">
          <GameBoard
            mode={mode}
            onModeChange={handleModeChange}
            currentLevel={currentLevel}
            onLevelComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
          />
        </div>
        <div className="md:w-72 md:shrink-0">
          <Sidebar
            mode={mode}
            currentLevel={currentLevel}
            onSelectLevel={handleSelectLevel}
          />
        </div>
      </main>
      <StoopFooter />
    </>
  );
}
