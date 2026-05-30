"use client";
import { useEffect, useRef, useState } from "react";
import { getPuzzleNumber, getTodayKey } from "@/lib/daily";
import RotatingAlsoPlay from "./RotatingAlsoPlay";

const TOTAL_LEVELS = 300;

interface SidebarProps {
  mode: "daily" | "levels";
  currentLevel: number;
  onSelectLevel: (n: number) => void;
}

interface Stats {
  streak: number;
  bestStreak: number;
  gamesPlayed: number;
  dailyWins: number;
  totalSolved: number;
}

function loadStats(): Stats {
  try {
    return {
      streak:      Number(localStorage.getItem("sl-streak")       || 0),
      bestStreak:  Number(localStorage.getItem("sl-best-streak")  || 0),
      gamesPlayed: Number(localStorage.getItem("sl-games-played") || 0),
      dailyWins:   Number(localStorage.getItem("sl-daily-wins")   || 0),
      totalSolved: Number(localStorage.getItem("sl-total-solved") || 0),
    };
  } catch {
    return { streak: 0, bestStreak: 0, gamesPlayed: 0, dailyWins: 0, totalSolved: 0 };
  }
}

function getLevelStatus(n: number, currentLevel: number): "completed" | "current" | "locked" {
  try {
    if (localStorage.getItem(`sl-level-done-${n}`) === "true") return "completed";
    if (n === currentLevel) return "current";
    if (n < currentLevel)   return "completed"; // unlocked via progression
    return "locked";
  } catch {
    return n === 1 ? "current" : "locked";
  }
}

export default function Sidebar({ mode, currentLevel, onSelectLevel }: SidebarProps) {
  const [stats, setStats]               = useState<Stats>({ streak: 0, bestStreak: 0, gamesPlayed: 0, dailyWins: 0, totalSolved: 0 });
  const [levelStatuses, setLevelStatuses] = useState<("completed" | "current" | "locked")[]>([]);
  const [howToOpen, setHowToOpen]       = useState(false);
  const puzzleNumber = getPuzzleNumber(getTodayKey());
  const currentLevelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setStats(loadStats());
    setLevelStatuses(Array.from({ length: TOTAL_LEVELS }, (_, i) => getLevelStatus(i + 1, currentLevel)));
  }, [mode, currentLevel]);

  // Scroll current level square into view whenever it changes
  useEffect(() => {
    if (mode !== "levels") return;
    const timer = setTimeout(() => {
      currentLevelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 80);
    return () => clearTimeout(timer);
  }, [mode, currentLevel]);

  const winRate = stats.gamesPlayed > 0
    ? `${Math.round((stats.dailyWins / stats.gamesPlayed) * 100)}%`
    : "—";

  return (
    <aside className="flex flex-col gap-5">
      {/* Header */}
      <div className="border-b border-[--rule] pb-4">
        <div
          className="text-2xl text-[--terracotta]"
          style={{ fontFamily: "var(--font-caprasimo)" }}
        >
          Sortl
        </div>
        <div className="text-xs text-[--ink-faded] mt-0.5">
          {mode === "daily"
            ? `#${String(puzzleNumber).padStart(3, "0")} · Pour, sort, solve.`
            : "Level by level — sort every tube."}
        </div>
      </div>

      {/* Stats */}
      <section>
        <SectionLabel>Your Stats</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <StatCell label="Streak"      value={`${stats.streak}🔥`} />
          <StatCell label="Best Streak" value={`${stats.bestStreak}🏆`} />
          {mode === "daily" ? (
            <>
              <StatCell label="Played"   value={stats.gamesPlayed} />
              <StatCell label="Win Rate" value={winRate} />
            </>
          ) : (
            <>
              <StatCell label="Levels Solved" value={stats.totalSolved} />
              <StatCell label="Current Level" value={currentLevel} />
            </>
          )}
        </div>
      </section>

      {/* How to Play — accordion on mobile */}
      <section>
        <button
          className="flex items-center justify-between w-full text-left"
          onClick={() => setHowToOpen(o => !o)}
          aria-expanded={howToOpen}
        >
          <SectionLabel asSpan>How to Play</SectionLabel>
          <span className="md:hidden text-[--ink-faded] text-xs pr-0.5 select-none" aria-hidden>
            {howToOpen ? "▲" : "▼"}
          </span>
        </button>
        <div className={`mt-2 text-sm text-[--ink-soft] space-y-1.5 ${howToOpen ? "block" : "hidden md:block"}`}>
          <p>Click a tube to select it, then click a target tube to pour.</p>
          <p>You can only pour onto the <em>same color</em>, or into an empty tube.</p>
          <p>Win by sorting every color into its own tube.</p>
        </div>
      </section>

      {/* Levels grid — only in levels mode */}
      {mode === "levels" && (
        <section>
          <SectionLabel>Levels</SectionLabel>
          <div className="grid grid-cols-10 gap-1 max-h-52 overflow-y-auto pr-0.5">
            {Array.from({ length: TOTAL_LEVELS }, (_, i) => {
              const n      = i + 1;
              const status = levelStatuses[i] ?? "locked";
              return (
                <button
                  key={n}
                  ref={n === currentLevel ? el => { currentLevelRef.current = el; } : null}
                  title={`Level ${n}`}
                  disabled={status === "locked"}
                  onClick={() => status !== "locked" && onSelectLevel(n)}
                  className={[
                    "w-6 h-6 rounded text-[9px] font-bold transition-colors leading-none",
                    status === "completed"
                      ? "bg-[--terracotta]/75 text-white hover:bg-[--terracotta]"
                      : status === "current"
                      ? "border-2 border-[--terracotta] text-[--terracotta] bg-transparent"
                      : "bg-[--paper-deep] text-[--ink-faded] opacity-35 cursor-not-allowed",
                  ].join(" ")}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Also Play */}
      <RotatingAlsoPlay />
    </aside>
  );
}

function SectionLabel({ children, asSpan }: { children: React.ReactNode; asSpan?: boolean }) {
  const cls = "block text-[10px] font-semibold text-[--ink-faded] uppercase tracking-widest mb-2";
  return asSpan
    ? <span className={cls}>{children}</span>
    : <div  className={cls}>{children}</div>;
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[--paper-2] border border-[--rule] rounded-xl p-3 text-center">
      <div
        className="text-xl font-bold text-[--ink] leading-tight"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        {value}
      </div>
      <div className="text-[10px] text-[--ink-faded] uppercase tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
