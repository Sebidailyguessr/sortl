"use client";
import { useState, useEffect, useRef } from "react";
import { getScoreLabel } from "@/lib/gameLogic";
import RotatingAlsoPlay from "./RotatingAlsoPlay";
import { trackEvent } from "@/utils/trackEvent";
import { useNextPuzzleCountdown } from "@/hooks/useNextPuzzleCountdown";

function getCountdown(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = Math.max(0, midnight.getTime() - now.getTime());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  won: boolean;
  stuck: boolean;
  moves: number;
  par: number;
  mode: "daily" | "levels";
  puzzleNumber?: number;
  levelNumber?: number;
  onClose: () => void;
  onNextLevel?: () => void;
  onPlayAgain?: () => void;
  onRestart?: () => void;
}

const mono = "'JetBrains Mono', ui-monospace, monospace";

const STREAK_MILESTONES = [3, 7, 14, 30]

function getEmojiRow(won: boolean, moves: number, par: number): string {
  if (!won) return '🟥🟥🟥🟥🟥'
  if (moves <= par)     return '🟩🟩🟩🟩🟩'
  if (moves <= par + 3) return '🟩🟩🟩🟩⬛'
  if (moves <= par + 8) return '🟩🟩🟩⬛⬛'
  return '🟩🟩⬛⬛⬛'
}

export default function ResultsOverlay({
  won, stuck, moves, par, mode, puzzleNumber, levelNumber,
  onClose, onNextLevel, onPlayAgain, onRestart,
}: Props) {
  const [countdown, setCountdown] = useState(getCountdown);
  const [copied, setCopied] = useState(false);
  const milestoneFired = useRef(false)

  const streakNextCountdown = useNextPuzzleCountdown()

  const streakState: 'active' | 'reset' | 'none' = (() => {
    if (typeof window === 'undefined') return 'none'
    try {
      const count = parseInt(localStorage.getItem('sl-streak') ?? '0', 10)
      const lastPlayed = localStorage.getItem('sl-last-played')
      if (!lastPlayed || count === 0) return 'none'
      const today = new Date()
      const last = new Date(lastPlayed)
      const diffDays = Math.floor(
        (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
         Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000
      )
      if (diffDays <= 1) return 'active'
      return 'reset'
    } catch {
      return 'none'
    }
  })()

  const streakCount = (() => {
    if (typeof window === 'undefined') return 0
    try {
      return parseInt(localStorage.getItem('sl-streak') ?? '0', 10)
    } catch {
      return 0
    }
  })()

  useEffect(() => {
    if (mode !== 'daily') return
    if (streakState === 'active' && STREAK_MILESTONES.includes(streakCount) && !milestoneFired.current) {
      milestoneFired.current = true
      trackEvent('streak_milestone', { game: 'sortl', milestone: streakCount })
    }
  }, [mode, streakState, streakCount])

  useEffect(() => {
    if (mode !== "daily") return;
    const id = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  const label = won ? getScoreLabel(moves, par, false) : "UNSORTED";
  const dayStr = String(puzzleNumber ?? 1).padStart(3, "0");

  const buildResultsCanvas = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      try {
        const W = 1200, H = 630;
        const canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        const num = mode === "daily" ? dayStr : String(levelNumber ?? 1).padStart(3, '0');
        const labelColor = won
          ? (label === 'FLAWLESS SORT' || label === 'CLEAN SORT' ? '#c45a3a' : '#8a7355')
          : '#6b5c4a';
        const detail = won ? `${moves} moves  par ${par}` : 'UNSORTED';

        ctx.fillStyle = '#f3e9d6'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2a1f15'; ctx.fillRect(0, 0, W, 160);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`SORTL #${num}`, W / 2, 80);
        ctx.fillStyle = labelColor; ctx.font = 'bold 44px monospace';
        ctx.fillText(label, W / 2, 295);
        ctx.fillStyle = '#2a1f15'; ctx.font = 'bold 30px monospace';
        ctx.fillText(detail, W / 2, 375);
        ctx.font = '48px sans-serif';
        ctx.fillText(getEmojiRow(won, moves, par), W / 2, 455);
        ctx.fillStyle = '#8a7355'; ctx.font = '16px monospace';
        ctx.fillText('sortl.stoop.games', W / 2, 596);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
      } catch { resolve(null); }
    });

  const handleShare = async () => {
    if (mode === "daily") trackEvent('share_clicked', { game: 'sl', puzzleNo: puzzleNumber });

    const pNum = mode === "daily" ? (puzzleNumber ?? 1) : (levelNumber ?? 1);
    const num = String(pNum).padStart(3, '0');
    const detail = won ? `${moves} moves  par ${par}` : 'UNSORTED';
    const shareUrl = `${window.location.origin}/share?n=${pNum}&label=${encodeURIComponent(label.replace(/_/g, ' '))}&detail=${encodeURIComponent(detail)}`;
    const emojiRow = getEmojiRow(won, moves, par);
    const text = `🧪 Sortl #${num}\n${label}\n${emojiRow}\n${shareUrl}`;

    if (typeof navigator.canShare === 'function') {
      const blob = await buildResultsCanvas();
      if (blob) {
        const file = new File([blob], 'sortl.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          try { await navigator.share({ files: [file], text, url: shareUrl }); return; } catch { /* cancelled */ }
        }
      }
      if (navigator.canShare({ url: shareUrl })) {
        try { await navigator.share({ title: `Sortl #${num}`, text, url: shareUrl }); return; } catch { /* cancelled */ }
      }
    }

    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(42,31,21,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--paper, #f3e9d6)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          border: "1px dashed rgba(42,31,21,0.22)",
          boxShadow: "0 8px 40px rgba(42,31,21,0.18)",
        }}
      >
        {/* X button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 10, right: 12,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: mono, fontSize: 18, color: "var(--ink-faded, #8a7355)",
            lineHeight: 1, padding: "4px 6px",
          }}
        >×</button>

        <div style={{ padding: "24px 24px 20px" }}>
          {/* Header */}
          <p style={{
            fontFamily: mono, fontSize: 10, color: "var(--ink-faded, #8a7355)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            margin: "0 0 14px",
          }}>
            SORTL #{dayStr} · {mode === "daily" ? "DAILY" : `LEVEL ${levelNumber}`}
          </p>

          {/* Result label */}
          <p style={{
            fontFamily: "'Caprasimo', serif",
            fontSize: 28, color: "var(--terracotta, #c45a3a)",
            margin: "0 0 4px", lineHeight: 1.15,
          }}>{label}</p>

          {/* Moves */}
          {won && (
            <>
              <p style={{
                fontFamily: "'Newsreader', Georgia, serif",
                fontSize: 40, fontWeight: 700, color: "var(--ink, #2a1f15)",
                margin: "8px 0 2px", lineHeight: 1,
              }}>
                {moves}
                <span style={{ fontSize: 20, fontWeight: 400, color: "var(--ink-faded, #8a7355)", marginLeft: 6 }}>
                  moves
                </span>
              </p>
              <p style={{
                fontFamily: mono, fontSize: 11, color: "var(--ink-faded, #8a7355)",
                margin: "2px 0 18px",
              }}>par {par}</p>
            </>
          )}

          {/* Stuck message */}
          {stuck && (
            <p style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontSize: 16, color: "var(--ink-soft, #5a4632)",
              margin: "8px 0 18px", lineHeight: 1.5,
            }}>No valid moves remain.</p>
          )}

          {/* Mode-specific content */}
          {mode === "daily" ? (
            <div style={{ marginBottom: 16 }}>
              <p style={{
                fontFamily: mono, fontSize: 20, fontWeight: 600,
                color: "var(--ink, #2a1f15)", letterSpacing: "0.06em",
                margin: 0,
              }}>{countdown}</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
              {won && onNextLevel && (
                <button
                  onClick={onNextLevel}
                  style={{
                    width: "100%", padding: "12px",
                    background: "var(--terracotta, #c45a3a)", color: "white",
                    border: "none", borderRadius: 8,
                    fontFamily: mono, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    cursor: "pointer",
                  }}
                >Next Level →</button>
              )}
              {onPlayAgain && (
                <button
                  onClick={onPlayAgain}
                  style={{
                    width: "100%", padding: "12px",
                    background: "transparent",
                    color: "var(--ink-soft, #5a4632)",
                    border: "1px dashed rgba(42,31,21,0.3)",
                    borderRadius: 8,
                    fontFamily: mono, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    cursor: "pointer",
                  }}
                >↺ Play again</button>
              )}
              {stuck && onRestart && (
                <button
                  onClick={onRestart}
                  style={{
                    width: "100%", padding: "12px",
                    background: "transparent",
                    color: "var(--ink-soft, #5a4632)",
                    border: "1px dashed rgba(42,31,21,0.3)",
                    borderRadius: 8,
                    fontFamily: mono, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    cursor: "pointer",
                  }}
                >↺ Try again</button>
              )}
            </div>
          )}

          {/* Share button */}
          <button
            onClick={handleShare}
            style={{
              width: "100%", padding: "12px",
              background: copied ? "#5a4632" : "var(--terracotta, #c45a3a)",
              color: "white",
              border: "none", borderRadius: 8,
              fontFamily: mono, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.18em",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >{copied ? "✓ Copied!" : "Share"}</button>

          <a href='https://ko-fi.com/stoopgames' target='_blank' rel='noopener noreferrer' onClick={() => trackEvent('kofi_clicked', { game: 'sl' })} style={{display:'block',textAlign:'center',fontFamily:'monospace',fontSize:'11px',color:'#8a7355',letterSpacing:'0.05em',textDecoration:'none',marginTop:'12px'}}>☕ enjoyed it? buy me a coffee</a>

          {/* Streak milestone badge */}
          {mode === "daily" && streakState === 'active' && STREAK_MILESTONES.includes(streakCount) && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <span style={{
                display: 'inline-block',
                background: 'rgba(196, 90, 58, 0.08)',
                border: '1px solid rgba(196, 90, 58, 0.25)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontFamily: mono,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#c45a3a',
              }}>
                🔥 {streakCount}-day streak! You&apos;re a regular.
              </span>
            </div>
          )}

          {/* Streak reminder */}
          {mode === "daily" && (
            <div style={{ fontFamily: mono, fontSize: '11px', color: '#8a7355', textAlign: 'center', padding: '12px 0' }}>
              {streakState === 'active' && streakCount >= 1 ? (
                <>
                  <div>🔥 {streakCount}-day streak — next puzzle in {streakNextCountdown}</div>
                  <div>Come back tomorrow to keep it.</div>
                </>
              ) : streakState === 'reset' ? (
                <div>💔 Streak reset. Start a new one — next puzzle in {streakNextCountdown}</div>
              ) : (
                <>
                  <div>🧩 New puzzle every day at midnight.</div>
                  <div>See you tomorrow 👋</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Also Play */}
        <div style={{
          borderTop: "1px dashed rgba(42,31,21,0.18)",
          padding: "16px 24px 20px",
        }}>
          <p style={{
            fontFamily: mono, fontSize: 9, letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--ink-faded, #8a7355)",
            margin: "0 0 10px",
          }}>Also Play</p>
          <RotatingAlsoPlay />
        </div>
      </div>
    </div>
  );
}
