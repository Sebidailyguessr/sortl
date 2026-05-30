"use client";
import { useEffect, useState } from "react";
import { getScoreLabel } from "@/lib/gameLogic";

const mono = "'JetBrains Mono', ui-monospace, monospace";

interface Props {
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
      setTime(`${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
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
}: Props) {
  const countdown = useCountdown();
  const [copied, setCopied] = useState(false);

  if (!visible || (!won && !stuck)) return null;

  const label = won ? getScoreLabel(moves, par, false) : "UNSORTED";

  const shareText = mode === "daily"
    ? `🧪 Sortl #${String(puzzleNumber ?? 1).padStart(3,"0")}\n${
        won ? `Solved in ${moves} moves ✓` : "Could not sort today 💀"
      }\nsortl.stoop.games`
    : `🧪 Sortl Level ${levelNumber}\n${
        won ? `Solved in ${moves} moves ✓` : "Could not sort 💀"
      }\nsortl.stoop.games`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
    } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const puzzleId = mode === "daily"
    ? `#${String(puzzleNumber ?? 1).padStart(3,"0")}`
    : `Level #${String(levelNumber).padStart(3,"0")}`;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(42,31,21,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      animation: "overlayFadeIn 300ms ease-out both",
    }}>
      <div style={{
        background: "var(--paper, #f3e9d6)",
        border: "1px dashed rgba(42,31,21,0.18)",
        borderRadius: 12,
        padding: "32px 28px",
        maxWidth: 340,
        width: "100%",
        textAlign: "center",
        fontFamily: mono,
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Caprasimo', serif",
          fontSize: 28,
          color: "var(--ink, #2a1f15)",
          marginBottom: 4,
        }}>
          {won ? "🧪" : "😵"} Sortl
        </div>

        {/* Puzzle ID */}
        <div style={{
          fontSize: 11, color: "var(--ink-faded, #8a7355)",
          letterSpacing: "0.1em", marginBottom: 20,
        }}>
          {puzzleId}
        </div>

        {/* Score label */}
        <div style={{
          fontSize: 13, fontWeight: 600,
          color: "var(--terracotta, #c45a3a)",
          letterSpacing: "0.12em", marginBottom: 8,
        }}>
          {label}
        </div>

        {/* Move count */}
        {won && (
          <>
            <div style={{
              fontSize: 32, fontWeight: 700,
              color: "var(--ink, #2a1f15)", marginBottom: 4,
            }}>
              {moves}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faded, #8a7355)", marginBottom: 24 }}>
              moves · par {par}
            </div>
          </>
        )}

        {/* Stuck message */}
        {stuck && (
          <div style={{ fontSize: 12, color: "var(--ink-soft, #5a4632)", marginBottom: 24 }}>
            No valid moves remain. Better luck next time!
          </div>
        )}

        {/* Primary action */}
        {mode === "levels" && won && onNextLevel ? (
          <button onClick={onNextLevel} style={primaryBtn}>
            Next Level →
          </button>
        ) : (
          <button onClick={handleShare} style={primaryBtn}>
            {copied ? "Copied ✓" : "Share result"}
          </button>
        )}

        {/* Secondary: Try Again / Replay */}
        {(stuck || (mode === "levels" && won)) && onRestart && (
          <button onClick={onRestart} style={secondaryBtn}>
            {stuck ? "Try Again" : "Replay"}
          </button>
        )}

        {/* Daily countdown */}
        {mode === "daily" && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, color: "var(--ink-faded, #8a7355)", letterSpacing: "0.1em" }}>
              NEXT PUZZLE IN
            </div>
            <div style={{
              fontSize: 20, fontWeight: 700,
              color: "var(--ink, #2a1f15)",
              letterSpacing: "0.05em", marginTop: 2,
            }}>
              {countdown}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "var(--terracotta, #c45a3a)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 28px",
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 12,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
  width: "100%",
  marginBottom: 10,
};

const secondaryBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--ink-faded, #8a7355)",
  border: "1px dashed rgba(42,31,21,0.18)",
  borderRadius: 8,
  padding: "10px 28px",
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
  width: "100%",
};
