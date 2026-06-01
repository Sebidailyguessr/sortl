"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Tube, { LAYER_H, TUBE_W } from "./Tube";
import ResultsOverlay from "./ResultsOverlay";
import { LevelConfig } from "@/lib/levels";
import {
  GameState, applyMove, calcPar, isStuck, isValidMove, isWon,
  makeInitialState, undoMove,
} from "@/lib/gameLogic";
import { getDailyLevel, getTodayKey, getPuzzleNumber } from "@/lib/daily";
import { generateLevel } from "@/lib/levels";

type Mode = "daily" | "levels";

// ── Pour animation ──────────────────────────────────────────────────────────

interface AnimState {
  fromIdx: number;
  toIdx: number;
  color: string;
  srcRect: DOMRect;
  dstRect: DOMRect;
  lh: number;
  tw: number;
}

function PourLayer({ anim, onDone }: { anim: AnimState; onDone: () => void }) {
  const elRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const el = elRef.current;
    if (!el) { onDoneRef.current(); return; }

    const { srcRect, dstRect, lh } = anim;
    const LIFT = 70;
    const dx = dstRect.left - srcRect.left;
    const dy = dstRect.top  - srcRect.top;

    const animation = el.animate(
      [
        { transform: "translate(0, 0)",                       offset: 0    },
        { transform: `translate(0, ${-LIFT}px)`,              offset: 0.36 },
        { transform: `translate(${dx}px, ${-LIFT}px)`,        offset: 0.64 },
        { transform: `translate(${dx}px, ${dy}px)`,           offset: 1    },
      ],
      { duration: 450, easing: "ease-in-out", fill: "forwards" }
    );

    animation.onfinish = () => onDoneRef.current();
    return () => animation.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={elRef}
      style={{
        position: "fixed",
        top: anim.srcRect.top,
        left: anim.srcRect.left,
        width: anim.tw,
        height: anim.lh,
        background: anim.color,
        borderRadius: 4,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}

// ── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#c45a3a", "#d49a3a", "#7a8a5e", "#6b4858", "#4a7a8a", "#8a6a3a"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 3 + (i / 19) * 94,
      delay: (i % 5) * 0.11,
      size: 7 + (i % 3) * 5,
      duration: 1.4 + (i % 4) * 0.22,
      color: CONFETTI_COLORS[i % 6],
      round: i % 3 !== 0,
    }))
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 49 }}
    >
      {particles.current.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: -24,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadLS<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveLS(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── GameBoard ─────────────────────────────────────────────────────────────────

interface Props {
  mode: Mode;
  onModeChange: (m: Mode) => void;
  currentLevel: number;
  onLevelComplete: (level: number, moves: number) => void;
  onNextLevel: () => void;
  onPlayAgain?: (level: number) => void;
}

export default function GameBoard({
  mode, onModeChange, currentLevel, onLevelComplete, onNextLevel, onPlayAgain,
}: Props) {
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [gameState, setGameState]     = useState<GameState | null>(null);
  const [selected, setSelected]       = useState<number | null>(null);
  const [invalidTube, setInvalidTube] = useState<number | null>(null);
  const [animState, setAnimState]     = useState<AnimState | null>(null);
  const [pulsing, setPulsing]         = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [compact, setCompact]         = useState(false);
  const [savedResult, setSavedResult] = useState<{ moves: number; par: number } | null>(null);

  const tubeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const invalidTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevWon   = useRef(false);
  const prevStuck = useRef(false);
  const winMovesRef = useRef(0);

  const dateKey      = getTodayKey();
  const puzzleNumber = getPuzzleNumber(dateKey);

  // ── Compact (mobile) detection ─────────────────────────────────────────────
  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Load/init level ────────────────────────────────────────────────────────
  useEffect(() => {
    resetOverlayState();
    let config: LevelConfig;
    if (mode === "daily") {
      config = getDailyLevel(dateKey);
      const saved = loadLS<Partial<GameState>>(`sl-daily-${dateKey}`);
      if (saved?.tubes) {
        const loadedState = { ...makeInitialState(config.tubes, config.tubeCapacity), ...saved } as GameState;
        setLevelConfig(config);
        setGameState(loadedState);
        return;
      }
    } else {
      config = generateLevel(currentLevel * 7919, currentLevel);
      if (localStorage.getItem(`sl-level-done-${currentLevel}`) === "true") {
        const savedMoves = parseInt(localStorage.getItem(`sl-level-best-${currentLevel}`) ?? "0");
        const computedPar = calcPar(config.tubes, config.tubeCapacity);
        setLevelConfig(config);
        setGameState(makeInitialState(config.tubes, config.tubeCapacity));
        setSelected(null);
        setSavedResult({ moves: savedMoves, par: computedPar });
        setShowOverlay(true);
        return;
      }
    }
    setLevelConfig(config);
    setGameState(makeInitialState(config.tubes, config.tubeCapacity));
    setSelected(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentLevel, dateKey]);

  // ── Persist daily state ────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === "daily" && gameState) saveLS(`sl-daily-${dateKey}`, gameState);
  }, [mode, dateKey, gameState]);

  // ── Win / Stuck overlay delay ──────────────────────────────────────────────
  useEffect(() => {
    if (gameState?.won && !prevWon.current) {
      prevWon.current = true;
      setPulsing(true);
      const t = setTimeout(() => {
        setPulsing(false);
        setShowOverlay(true);
        setShowConfetti(true);
      }, 650);
      return () => clearTimeout(t);
    }
    if (gameState?.stuck && !prevStuck.current) {
      prevStuck.current = true;
      const t = setTimeout(() => setShowOverlay(true), 300);
      return () => clearTimeout(t);
    }
  }, [gameState?.won, gameState?.stuck]);

  // ── Streak & stats on completion ───────────────────────────────────────────
  useEffect(() => {
    if (!gameState?.won && !gameState?.stuck) return;

    if (mode === "daily") {
      // Idempotency guard — prevents double-recording on page reload with saved state
      const lastPlayed = localStorage.getItem("sl-last-played");
      if (lastPlayed === dateKey) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().slice(0, 10);

      // games-played increments on any completion (win or stuck)
      const played = Number(localStorage.getItem("sl-games-played") || 0);
      localStorage.setItem("sl-games-played", String(played + 1));

      if (gameState.won) {
        // Streak: +1 if played yesterday, else reset to 1
        let streak = Number(localStorage.getItem("sl-streak") || 0);
        streak = lastPlayed === yKey ? streak + 1 : 1;
        localStorage.setItem("sl-streak", String(streak));
        const best = Number(localStorage.getItem("sl-best-streak") || 0);
        if (streak > best) localStorage.setItem("sl-best-streak", String(streak));
        // Win count for win-rate stat
        const wins = Number(localStorage.getItem("sl-daily-wins") || 0);
        localStorage.setItem("sl-daily-wins", String(wins + 1));
      }
      // last-played always set so tomorrow's streak check works correctly
      localStorage.setItem("sl-last-played", dateKey);
    }

    if (mode === "levels" && gameState.won) onLevelComplete(currentLevel, winMovesRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.won, gameState?.stuck]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function resetOverlayState() {
    setShowOverlay(false);
    setShowConfetti(false);
    setPulsing(false);
    setAnimState(null);
    setSelected(null);
    setSavedResult(null);
    prevWon.current   = false;
    prevStuck.current = false;
    winMovesRef.current = 0;
  }

  const lh = compact ? LAYER_H.compact : LAYER_H.full;
  const tw = compact ? TUBE_W.compact  : TUBE_W.full;

  const applyPendingMove = useCallback(
    (fromIdx: number, toIdx: number) => {
      setGameState(prev => {
        if (!prev || !levelConfig) return prev;
        const newTubes = applyMove(prev.tubes, fromIdx, toIdx);
        const won   = isWon(newTubes, levelConfig.tubeCapacity);
        const stuck = !won && isStuck(newTubes, levelConfig.tubeCapacity);
        const moves = prev.moves + 1;
        if (won) winMovesRef.current = moves;
        return {
          ...prev,
          tubes:   newTubes,
          moves,
          history: [...prev.history, prev.tubes],
          won,
          stuck,
        };
      });
      setAnimState(null);
      setSavedResult(null);
    },
    [levelConfig]
  );

  function handleTubeClick(idx: number) {
    if (!gameState || !levelConfig) return;
    if (gameState.won || gameState.stuck) return;
    if (animState !== null) return; // block during pour

    if (selected === null) {
      if (gameState.tubes[idx].length === 0) return;
      setSelected(idx);
      return;
    }
    if (selected === idx) { setSelected(null); return; }

    if (!isValidMove(gameState.tubes, selected, idx, levelConfig.tubeCapacity)) {
      if (invalidTimer.current) clearTimeout(invalidTimer.current);
      setInvalidTube(selected);
      invalidTimer.current = setTimeout(() => setInvalidTube(null), 500);
      setSelected(null);
      return;
    }

    // Valid move — kick off pour animation
    const srcEl = tubeRefs.current[selected];
    const dstEl = tubeRefs.current[idx];
    const color  = gameState.tubes[selected][gameState.tubes[selected].length - 1];
    setSelected(null);

    if (srcEl && dstEl) {
      const srcRect = srcEl.getBoundingClientRect();
      const dstRect = dstEl.getBoundingClientRect();
      setAnimState({ fromIdx: selected, toIdx: idx, color, srcRect, dstRect, lh, tw });
    } else {
      applyPendingMove(selected, idx);
    }
  }

  const handleAnimDone = useCallback(() => {
    if (!animState) return;
    applyPendingMove(animState.fromIdx, animState.toIdx);
  }, [animState, applyPendingMove]);

  function handleUndo() {
    if (!gameState || animState) return;
    setGameState(undoMove(gameState));
    setSelected(null);
  }

  function handleRestart() {
    if (!levelConfig) return;
    resetOverlayState();
    setGameState(makeInitialState(levelConfig.tubes, levelConfig.tubeCapacity));
  }

  function handlePlayAgainLevel() {
    if (!levelConfig) return;
    onPlayAgain?.(currentLevel);
    resetOverlayState();
    setGameState(makeInitialState(levelConfig.tubes, levelConfig.tubeCapacity));
  }

  function handleNextLevel() {
    resetOverlayState();
    onNextLevel();
  }

  // ── par — always computed (safe before early return) ──────────────────────
  const par = useMemo(
    () => levelConfig ? calcPar(levelConfig.tubes, levelConfig.tubeCapacity) : 0,
    [levelConfig]
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!gameState || !levelConfig) {
    return <div className="flex items-center justify-center h-64 text-[--ink-faded]">Loading…</div>;
  }

  const isDailyDone = mode === "daily" && (gameState.won || gameState.stuck);

  // During animation: hide flying layer from source tube
  const displayTubes = animState
    ? gameState.tubes.map((tube, i) =>
        i === animState.fromIdx ? tube.slice(0, -1) : tube
      )
    : gameState.tubes;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "24px 16px" }}>

      {/* Mode toggle — matches Bloom/Palette exactly */}
      <div style={{
        display: "flex",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px dashed rgba(42,31,21,0.18)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {(["daily", "levels"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: "8px 20px",
              background: mode === m ? "var(--terracotta, #c45a3a)" : "transparent",
              color: mode === m ? "#fff" : "var(--ink-soft, #5a4632)",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Puzzle label */}
      <div style={{
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11,
        color: "var(--ink-faded, #8a7355)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {mode === "daily"
          ? `Sortl #${String(puzzleNumber).padStart(3, "0")}`
          : `Level #${String(currentLevel).padStart(3, "0")}`}
      </div>

      {/* Controls row: move counter + undo/restart */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", maxWidth: 480,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 13, color: "var(--ink-faded, #8a7355)",
          letterSpacing: "0.08em",
        }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: "var(--ink, #2a1f15)" }}>
            {gameState.moves}
          </span>
          {" "}moves · par {par}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleUndo}
            disabled={gameState.history.length === 0 || isDailyDone || !!animState}
            style={ctrlBtn}
          >
            ↩ Undo
          </button>
          <button
            onClick={handleRestart}
            style={ctrlBtn}
          >
            ↺ Restart
          </button>
        </div>
      </div>

      {/* Tubes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end", justifyContent: "center" }}>
        {displayTubes.map((tube, i) => {
          const complete = tube.length === levelConfig.tubeCapacity && tube.every(c => c === tube[0]);
          return (
            <Tube
              key={i}
              ref={el => { tubeRefs.current[i] = el; }}
              tube={tube}
              capacity={levelConfig.tubeCapacity}
              selected={selected === i}
              complete={complete}
              pulsing={pulsing && complete}
              invalid={invalidTube === i}
              compact={compact}
              onClick={() => handleTubeClick(i)}
            />
          );
        })}
      </div>

      {/* Flying layer during pour */}
      {animState && <PourLayer anim={animState} onDone={handleAnimDone} />}

      {/* Confetti on win */}
      {showConfetti && <Confetti />}

      {/* 📊 Results button — shown when game is over and overlay is dismissed */}
      {(gameState.won || gameState.stuck || savedResult !== null) && !showOverlay && (
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => setShowOverlay(true)}
            style={{
              padding: "10px 22px",
              background: "transparent",
              color: "var(--ink-soft, #5a4632)",
              border: "1px dashed rgba(42,31,21,0.3)",
              borderRadius: 8,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              cursor: "pointer",
            }}
          >
            📊 Results
          </button>
          {mode === "levels" && (gameState.won || savedResult !== null) && (
            <button
              onClick={handleNextLevel}
              style={{
                padding: "10px 22px",
                background: "var(--terracotta, #c45a3a)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                cursor: "pointer",
              }}
            >
              Next Level →
            </button>
          )}
        </div>
      )}

      {/* Results overlay */}
      {showOverlay && (
        <ResultsOverlay
          won={savedResult !== null || gameState.won}
          stuck={savedResult === null && gameState.stuck}
          moves={savedResult?.moves ?? gameState.moves}
          par={savedResult?.par ?? par}
          mode={mode}
          puzzleNumber={puzzleNumber}
          levelNumber={currentLevel}
          onClose={() => setShowOverlay(false)}
          onNextLevel={handleNextLevel}
          onPlayAgain={mode === "levels" && (savedResult !== null || gameState.won) ? handlePlayAgainLevel : undefined}
          onRestart={savedResult === null && gameState.stuck ? handleRestart : undefined}
        />
      )}
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  padding: "6px 14px",
  background: "transparent",
  color: "var(--ink-soft, #5a4632)",
  border: "1px dashed rgba(42,31,21,0.18)",
  borderRadius: 6,
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  cursor: "pointer",
  transition: "opacity 0.15s",
};
