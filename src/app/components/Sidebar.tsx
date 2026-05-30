"use client";
import { useEffect, useRef, useState } from "react";
import { getPuzzleNumber, getTodayKey } from "@/lib/daily";
import RotatingAlsoPlay from "./RotatingAlsoPlay";

const TOTAL_LEVELS = 300;

const SCORING: [string, string][] = [
  ["≤ par",      "FLAWLESS SORT"],
  ["par +1–3",   "CLEAN SORT"],
  ["par +4–8",   "DECENT SORT"],
  ["par +9+",    "MESSY SORT"],
  ["stuck",      "UNSORTED"],
];

interface Props {
  mode: "daily" | "levels";
  currentLevel: number;
  onSelectLevel: (n: number) => void;
}

export default function Sidebar({ mode, currentLevel, onSelectLevel }: Props) {
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [dailyWins, setDailyWins]     = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [doneLevels, setDoneLevels]   = useState<Set<number>>(new Set());

  const currentLevelRef = useRef<HTMLButtonElement | null>(null);
  const puzzleNumber    = getPuzzleNumber(getTodayKey());

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("sl-streak")       || "0"));
    setBestStreak(parseInt(localStorage.getItem("sl-best-streak")  || "0"));
    setGamesPlayed(parseInt(localStorage.getItem("sl-games-played") || "0"));
    setDailyWins(parseInt(localStorage.getItem("sl-daily-wins")   || "0"));
    setTotalSolved(parseInt(localStorage.getItem("sl-total-solved") || "0"));

    const done = new Set<number>();
    for (let n = 1; n <= TOTAL_LEVELS; n++) {
      if (localStorage.getItem(`sl-level-done-${n}`) === "true") done.add(n);
    }
    setDoneLevels(done);
  }, [mode, currentLevel]);

  // Scroll current level into view
  useEffect(() => {
    if (mode !== "levels") return;
    const t = setTimeout(() => {
      currentLevelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [mode, currentLevel]);

  const winRate = gamesPlayed > 0
    ? `${Math.round((dailyWins / gamesPlayed) * 100)}%`
    : "—";

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-[#ebdfc4] border-l border-[rgba(42,31,21,0.18)] overflow-y-auto lg:sticky lg:top-[44px] lg:self-start lg:max-h-[calc(100vh-44px)]">

      {/* Branding */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <span className="text-[#2a1f15] select-none"
          style={{ fontFamily: "'Caprasimo', serif", fontSize: 18 }}>
          Sortl
        </span>
        <p className="text-[#8a7355] text-xs mt-0.5 font-mono">
          {mode === "daily"
            ? `#${String(puzzleNumber).padStart(3, "0")} · Pour, sort, solve.`
            : "300 levels · sort every tube."}
        </p>
      </div>

      {/* Your Stats */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Your Stats</h2>
        {gamesPlayed === 0 && totalSolved === 0 ? (
          <p className="text-[#8a7355] text-xs">Play your first game to see stats</p>
        ) : (
          <div className="space-y-2.5">
            {mode === "daily" ? (
              <>
                {([
                  ["🔥", "Streak",       `${streak} day${streak !== 1 ? "s" : ""}`],
                  ["⚡", "Best streak",  `${bestStreak} day${bestStreak !== 1 ? "s" : ""}`],
                  ["📅", "Games played", String(gamesPlayed)],
                  ["🏆", "Win rate",     winRate],
                ] as [string, string, string][]).map(([icon, label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-[#5a4632]">{icon} {label}</span>
                    <span className="text-[#2a1f15] font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {([
                  ["🧪", "Levels solved",  String(totalSolved)],
                  ["🔥", "Streak",         `${streak} day${streak !== 1 ? "s" : ""}`],
                  ["⚡", "Best streak",    `${bestStreak} day${bestStreak !== 1 ? "s" : ""}`],
                  ["📅", "Games played",   String(gamesPlayed)],
                ] as [string, string, string][]).map(([icon, label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-[#5a4632]">{icon} {label}</span>
                    <span className="text-[#2a1f15] font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Levels grid */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Levels</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 14px)",
          gap: 3,
          maxHeight: 200,
          overflowY: "auto",
        }}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(n => {
            const isDone    = doneLevels.has(n);
            const isCurrent = n === currentLevel;
            return (
              <button
                key={n}
                ref={isCurrent ? el => { currentLevelRef.current = el; } : null}
                onClick={() => onSelectLevel(n)}
                title={`Level ${n}${isDone ? " ✓" : isCurrent ? " (current)" : ""}`}
                style={{
                  width: 14, height: 14, borderRadius: 3,
                  background: (isDone || isCurrent) ? "#c45a3a" : "rgba(42,31,21,0.1)",
                  opacity: (isCurrent && !isDone) ? 0.5 : 1,
                  outline: isCurrent ? "2px solid #c45a3a" : "none",
                  outlineOffset: 1,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
        <p className="text-xs mt-2 font-mono">
          <span style={{ color: "#c45a3a" }}>{doneLevels.size}</span>
          <span style={{ color: "#8a7355" }}> / {TOTAL_LEVELS} completed</span>
        </p>
      </div>

      {/* How to Play */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">How to Play</h2>
        <ol className="space-y-2.5 mb-4">
          {[
            { icon: "🧪", text: "Click a tube to select it." },
            { icon: "💧", text: "Click a target tube to pour the top layer." },
            { icon: "✅", text: "You can only pour onto the same colour, or into an empty tube." },
            { icon: "🏆", text: "Win by sorting every colour into its own tube." },
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#5a4632] leading-snug">
              <span className="shrink-0 mt-px">{step.icon}</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>

        <div className="bg-[var(--paper)] rounded-xl p-3 border border-dashed border-[rgba(42,31,21,0.18)]">
          <p className="text-[#5a4632] text-xs font-semibold uppercase tracking-widest mb-2 font-mono">Scoring</p>
          <div className="space-y-1">
            {SCORING.map(([moves, label]) => (
              <div key={label} className="flex items-center text-xs gap-2">
                <span className="text-[#8a7355] w-16 shrink-0 font-mono">{moves}</span>
                <span className="text-[#2a1f15] font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Also Play */}
      <div className="px-5 py-4 shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Also Play</h2>
        <RotatingAlsoPlay />
      </div>

    </aside>
  );
}
