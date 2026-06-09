"use client";
import { useEffect, useState } from "react";
import { getPuzzleNumber, getTodayKey } from "@/lib/daily";
import RotatingAlsoPlay from "./RotatingAlsoPlay";

const TOTAL_LEVELS = 300;

const SCORING: [string, string][] = [
  ["≤ par",    "FLAWLESS SORT"],
  ["par +1–3", "CLEAN SORT"],
  ["par +4–8", "DECENT SORT"],
  ["par +9+",  "MESSY SORT"],
  ["stuck",    "UNSORTED"],
];

interface Props {
  mode: "daily" | "levels";
  currentLevel: number;
  onSelectLevel: (n: number) => void;
  isNewUser?: boolean;
  dailyDone?: boolean;
}

export default function Sidebar({ mode, currentLevel, onSelectLevel, isNewUser = false, dailyDone = false }: Props) {
  const puzzleNumber = getPuzzleNumber(getTodayKey());
  const [streak, setStreak]           = useState(0);
  const [bestStreak, setBestStreak]   = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [doneLevels, setDoneLevels]   = useState<Set<number>>(new Set());

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("sl-streak") || "0"));
    setBestStreak(parseInt(localStorage.getItem("sl-best-streak") || "0"));
    setGamesPlayed(parseInt(localStorage.getItem("sl-games-played") || "0"));

    const done = new Set<number>();
    for (let n = 1; n <= TOTAL_LEVELS; n++) {
      if (localStorage.getItem(`sl-level-done-${n}`) === "true") done.add(n);
    }
    setDoneLevels(done);
  }, []);

  return (
    <aside className="w-full min-h-full bg-[#ebdfc4] border-l border-dashed border-[rgba(42,31,21,0.18)]">

      {/* Branding */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <span style={{ fontFamily: "'Caprasimo', serif", fontSize: 18, color: "var(--ink, #2a1f15)" }}>
          Sortl
        </span>
        <p className="text-[#8a7355] text-xs mt-0.5 font-mono">
          {mode === "daily"
            ? `#${String(puzzleNumber).padStart(3, "0")} · Sort the tubes. One shot.`
            : `Level ${currentLevel} · 300 levels. No limits.`}
        </p>
      </div>

      {/* Daily hint badge — new users only, daily mode, not done */}
      {isNewUser && !dailyDone && mode === "daily" && (
        <p className="px-5 py-1.5 text-[#8a7355] border-b border-[rgba(42,31,21,0.08)]"
           style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11 }}>
          🗓 New puzzle every day at midnight UTC
        </p>
      )}

      {/* Your Stats — daily only */}
      {mode === "daily" && (
        <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
          <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Your Stats</h2>
          {gamesPlayed === 0 ? (
            <p className="text-[#8a7355] text-xs">Play your first game to see stats</p>
          ) : (
            <div className="space-y-2.5">
              {([
                ["🔥", "Streak",      `${streak} day${streak !== 1 ? "s" : ""}`],
                ["⚡", "Best streak", `${bestStreak} day${bestStreak !== 1 ? "s" : ""}`],
                ["📅", "Games played", String(gamesPlayed)],
              ] as [string, string, string][]).map(([icon, label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-[#5a4632]">{icon} {label}</span>
                  <span className="text-[#2a1f15] font-semibold tabular-nums">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Levels grid — levels only */}
      {mode === "levels" && (
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
                  onClick={() => onSelectLevel(n)}
                  title={`Level ${n}${isDone ? " ✓" : isCurrent ? " (current)" : ""}`}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
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
      )}

      {/* How to Play */}
      <div className="px-5 py-4 border-b border-[rgba(42,31,21,0.18)] shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">How to Play</h2>
        <ol className="space-y-2.5 mb-4">
          {[
            { icon: "🧪", text: "Click a source tube to select the top layer." },
            { icon: "💧", text: "Click a destination tube to pour it." },
            { icon: "✅", text: "You can only pour onto the same colour or into an empty tube." },
            { icon: "🏆", text: mode === "daily" ? "Solve in as few moves as possible. One shot." : "Sort every colour into its own tube." },
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[#5a4632] leading-snug">
              <span className="shrink-0 mt-px">{step.icon}</span>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>

        {/* Scoring table — daily only */}
        {mode === "daily" && (
          <div className="bg-[var(--paper)] rounded-xl p-3 border border-dashed border-[rgba(42,31,21,0.18)]">
            <p className="text-[#5a4632] text-xs font-semibold uppercase tracking-widest mb-2 font-mono">Scoring</p>
            <div className="space-y-1">
              {SCORING.map(([condition, label]) => (
                <div key={label} className="flex items-center text-xs gap-2">
                  <span className="text-[#8a7355] w-20 shrink-0 font-mono">{condition}</span>
                  <span className="text-[#2a1f15] font-semibold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Also on Stoop (new users only) */}
      {isNewUser && (
        <div className="px-5 py-3 border-b border-[rgba(42,31,21,0.18)] shrink-0">
          <p style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#8a7355", lineHeight: 1.7 }}>
            🧩 Also on Stoop:{" "}
            {[
              { label: "dailyguessr.app",    url: "https://dailyguessr.app" },
              { label: "flagguessr.app",     url: "https://flagguessr.app" },
              { label: "cocktailguessr.app", url: "https://cocktailguessr.app" },
              { label: "palette.stoop.games",url: "https://palette.stoop.games" },
              { label: "bloom.stoop.games",  url: "https://bloom.stoop.games" },
            ].map((g, i, arr) => (
              <span key={g.url}>
                <a
                  href={g.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#c45a3a", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                >
                  {g.label}
                </a>
                {i < arr.length - 1 && <span style={{ color: "#8a7355" }}> · </span>}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Also Play */}
      <div className="px-5 py-4 shrink-0">
        <h2 className="text-[#8a7355] text-xs font-semibold uppercase tracking-widest mb-3 font-mono">Also Play</h2>
        <RotatingAlsoPlay />
      </div>

    </aside>
  );
}
