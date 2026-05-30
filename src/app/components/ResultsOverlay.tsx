"use client";
import { useEffect, useState } from "react";
import { getScoreLabel } from "@/lib/gameLogic";

interface ResultsOverlayProps {
  visible: boolean;
  won: boolean;
  stuck: boolean;
  moves: number;
  par: number;
  mode: "daily" | "levels";
  puzzleNumber?: number;
  levelNumber?: number;
  onNextLevel?: () => void;
  onRestart?: () => void;
}

function useCountdown() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now      = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function ResultsOverlay({
  visible, won, stuck, moves, par, mode,
  puzzleNumber, levelNumber, onNextLevel, onRestart,
}: ResultsOverlayProps) {
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);

  if (!visible || (!won && !stuck)) return null;

  const label = won ? getScoreLabel(moves, par, false) : "UNSORTED";

  const shareText = mode === "daily"
    ? `🧪 Sortl #${String(puzzleNumber ?? 1).padStart(3, "0")}\n${
        won ? `Solved in ${moves} moves ✓` : "Could not sort today 💀"
      }\nsortl.stoop.games`
    : `🧪 Sortl Level ${levelNumber}\n${
        won ? `Solved in ${moves} moves ✓` : "Could not sort 💀"
      }\nsortl.stoop.games`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const labelColor =
    label === "FLAWLESS SORT" ? "text-[--terracotta]"
    : label === "CLEAN SORT"  ? "text-[--terracotta]"
    : label === "DECENT SORT" ? "text-[--ink-soft]"
    : label === "MESSY SORT"  ? "text-[--ink-faded]"
    : "text-[--ink-faded]"; // UNSORTED

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[--ink]/40 backdrop-blur-sm">
      <div className="overlay-in bg-[--paper] border border-[--rule] rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4">
        {/* Icon */}
        <div className="text-5xl leading-none mt-1">
          {won ? (label === "FLAWLESS SORT" ? "✨" : "🧪") : "😵"}
        </div>

        {/* Score label */}
        <div
          className={`text-xl font-bold text-center tracking-wide ${labelColor}`}
          style={{ fontFamily: "var(--font-caprasimo)" }}
        >
          {label}
        </div>

        {/* Puzzle ID */}
        <div className="text-xs text-[--ink-faded] uppercase tracking-widest">
          {mode === "daily"
            ? `Puzzle #${String(puzzleNumber ?? 1).padStart(3, "0")}`
            : `Level ${levelNumber}`}
        </div>

        {/* Move count */}
        {won && (
          <div className="text-center">
            <div
              className="text-5xl font-bold text-[--ink] tabular-nums"
              style={{ fontFamily: "var(--font-jetbrains)" }}
            >
              {moves}
            </div>
            <div className="text-sm text-[--ink-faded] mt-0.5">
              moves &middot; par {par}
            </div>
          </div>
        )}

        {/* Stuck message */}
        {stuck && (
          <p className="text-[--ink-soft] text-sm text-center leading-relaxed">
            No valid moves remain. Better luck next time!
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded-xl bg-[--terracotta] text-white font-semibold text-sm hover:bg-[--terracotta-2] active:scale-95 transition-all"
          >
            {copied ? "Copied ✓" : "Copy Result"}
          </button>

          {mode === "levels" && won && onNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-2.5 rounded-xl border-2 border-[--terracotta] text-[--terracotta] font-semibold text-sm hover:bg-[--terracotta]/10 active:scale-95 transition-all"
            >
              Next Level →
            </button>
          )}

          {/* Try Again — shown for stuck in both modes, or levels replay */}
          {(stuck || (mode === "levels" && won)) && onRestart && (
            <button
              onClick={onRestart}
              className="w-full py-2 rounded-xl border border-[--rule] text-[--ink-soft] text-sm hover:bg-[--paper-2] active:scale-95 transition-all"
            >
              {stuck ? "Try Again" : "Replay"}
            </button>
          )}

          {/* Daily: countdown */}
          {mode === "daily" && (
            <div className="text-center pt-1">
              <p className="text-xs text-[--ink-faded]">Next puzzle in</p>
              <p
                className="text-lg font-semibold text-[--ink] tabular-nums"
                style={{ fontFamily: "var(--font-jetbrains)" }}
              >
                {countdown}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
