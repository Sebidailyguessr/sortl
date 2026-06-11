"use client";
import { Fragment, useEffect, useState } from "react";
import GameBoard from "./components/GameBoard";
import Sidebar from "./components/Sidebar";
import HowToPlayModal from "./components/HowToPlayModal";
import { trackEvent } from "@/utils/trackEvent";
import { getTodayKey } from "@/lib/daily";

type Mode = "daily" | "levels";

const MAX_LEVELS = 300;
const mono = "'JetBrains Mono', ui-monospace, monospace";

function findNextUnsolvedLevel(from: number): number {
  for (let n = from; n <= MAX_LEVELS; n++) {
    if (localStorage.getItem(`sl-level-done-${n}`) !== "true") return n;
  }
  return MAX_LEVELS;
}

export default function Home() {
  const [mode, setMode]               = useState<Mode>("daily");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [sidebarKey, setSidebarKey]   = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isNewUser, setIsNewUser]     = useState(false);
  const [dailyDone, setDailyDone]     = useState(false);

  useEffect(() => {
    try {
      const lastPlayed = localStorage.getItem("sl-last-played");
      if (lastPlayed) {
        const daysSince = Math.floor((Date.now() - new Date(lastPlayed).getTime()) / 86_400_000);
        if (daysSince < 8) trackEvent('returning_player', { game: 'sl', daysSince });
      } else {
        trackEvent('first_visit', { game: 'sl' });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("sl-seen-howtoplay")) {
      localStorage.setItem("sl-seen-howtoplay", "1");
      setShowOnboarding(true);
      setIsNewUser(true);
    }
    if (localStorage.getItem("sl-last-played") === getTodayKey()) {
      setDailyDone(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("sl-mode") as Mode | null;
      const activeMode: Mode = (savedMode === "daily" || savedMode === "levels") ? savedMode : "daily";
      setMode(activeMode);

      let savedLevel = Number(localStorage.getItem("sl-current-level") || 0);
      if (savedLevel < 1) savedLevel = 1;

      if (activeMode === "levels") {
        savedLevel = findNextUnsolvedLevel(savedLevel);
      }

      setCurrentLevel(savedLevel);
      localStorage.setItem("sl-current-level", String(savedLevel));
    } catch {}
  }, []);

  function handleModeChange(m: Mode) {
    setMode(m);
    try {
      localStorage.setItem("sl-mode", m);
      if (m === "levels") {
        const next = findNextUnsolvedLevel(currentLevel);
        if (next !== currentLevel) {
          setCurrentLevel(next);
          localStorage.setItem("sl-current-level", String(next));
        }
      }
    } catch {}
  }

  function handleLevelComplete(level: number, moves: number) {
    try {
      const alreadyDone = localStorage.getItem(`sl-level-done-${level}`) === "true";
      localStorage.setItem(`sl-level-done-${level}`, "true");
      const best = localStorage.getItem(`sl-level-best-${level}`);
      if (!best || moves < Number(best)) {
        localStorage.setItem(`sl-level-best-${level}`, String(moves));
      }
      if (!alreadyDone) {
        const solved = Number(localStorage.getItem("sl-total-solved") || 0);
        localStorage.setItem("sl-total-solved", String(solved + 1));
      }
      setSidebarKey(k => k + 1);
    } catch {}
  }

  function handleNextLevel() {
    try {
      const next = findNextUnsolvedLevel(currentLevel + 1);
      setCurrentLevel(next);
      localStorage.setItem("sl-current-level", String(next));
    } catch {}
  }

  function handleSelectLevel(n: number) {
    setCurrentLevel(n);
    setMode("levels");
    setSidebarKey(k => k + 1);
    try { localStorage.setItem("sl-current-level", String(n)); } catch {}
  }

  function handlePlayAgain(level: number) {
    try {
      localStorage.removeItem(`sl-level-done-${level}`);
      localStorage.removeItem(`sl-level-best-${level}`);
      setSidebarKey(k => k + 1);
    } catch {}
  }

  return (
    <>
      <HowToPlayModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Mobile daily hint badge */}
      {isNewUser && !dailyDone && mode === "daily" && (
        <div className="lg:hidden w-full px-4 pt-3">
          <p style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 11, color: "#8a7355" }}>
            🗓 New puzzle every day at midnight UTC
          </p>
        </div>
      )}

      <div className="w-full px-4 flex gap-6 items-stretch flex-1">

        {/* Game area */}
        <div className="flex-1 flex flex-col items-center pt-6">
          <div className="w-full max-w-2xl">
            <GameBoard
              mode={mode}
              onModeChange={handleModeChange}
              currentLevel={currentLevel}
              onLevelComplete={handleLevelComplete}
              onNextLevel={handleNextLevel}
              onPlayAgain={handlePlayAgain}
              onDailyComplete={() => setDailyDone(true)}
              onSelectLevel={handleSelectLevel}
            />
          </div>
        </div>

        {/* Sidebar — key forces remount after win so stats refresh */}
        <div className="hidden lg:block w-72 shrink-0">
          <Sidebar
            key={sidebarKey}
            mode={mode}
            currentLevel={currentLevel}
            isNewUser={isNewUser}
            dailyDone={dailyDone}
          />
        </div>

      </div>

      {/* Separator */}
      <div style={{ borderTop: "1px dashed rgba(42,31,21,0.18)", width: "100%" }} />

      {/* Below-the-fold content */}
      <div className="w-full max-w-2xl mx-auto px-4 py-16">

        {(() => {
          const SectionHeader = ({ children }: { children: string }) => (
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 32, height: 2, background: "var(--terracotta, #c45a3a)", flexShrink: 0 }} />
              <span style={{ fontFamily: mono, fontSize: 10, color: "var(--ink-faded, #8a7355)", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}>{children}</span>
            </div>
          );
          const Body = ({ children }: { children: React.ReactNode }) => (
            <div style={{ fontFamily: "'Newsreader', serif", fontSize: 16, color: "var(--ink-soft, #5a4632)", lineHeight: 1.65, maxWidth: "65ch" }}>{children}</div>
          );
          const P = ({ children }: { children: string }) => (
            <p style={{ marginBottom: "1rem" }}>{children}</p>
          );
          return (
            <>
              <section className="mb-12">
                <SectionHeader>What is Sortl?</SectionHeader>
                <Body>
                  <P>Sortl is a free daily liquid sorting puzzle. Every day at midnight a new puzzle is published — the same one for every player around the world. Test tubes are filled with layers of coloured liquid. Your job is to sort them so each tube contains only one colour.</P>
                  <P>Click a source tube to select the top layer, then click a destination tube to pour it. You can only pour onto the same colour or into an empty tube. Solve the puzzle in as few moves as possible.</P>
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>How to Play</SectionHeader>
                <Body>
                  {[
                    ["Step 1 — Read the board", "Each tube shows its layers top to bottom. You can only move the top layer of any tube, so plan around what's exposed now, not what's buried."],
                    ["Step 2 — Select and pour", "Click (or tap) a tube to pick up its top layer, then click a second tube to pour it. Click the same tube again to cancel the selection."],
                    ["Step 3 — Follow the two rules", "A layer can only move onto a matching colour, or into a fully empty tube. You can't pour onto a different colour, and you can't overfill a tube past its capacity."],
                    ["Step 4 — Pour in runs", "If the top of a tube has several same-coloured layers stacked together, they all move at once onto a matching destination — one efficient move instead of several wasteful ones."],
                    ["Step 5 — Sort every tube", "You win the moment each tube holds a single colour or is empty. Do it in as few moves as possible to beat par and earn a Flawless Sort."],
                  ].map(([title, body], i) => (
                    <p key={i} style={{ marginBottom: "1rem" }}>
                      <strong style={{ color: "#2a1f15", display: "block", marginBottom: 2 }}>{title}</strong>
                      {body}
                    </p>
                  ))}
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>How Scoring Works</SectionHeader>
                <Body>
                  <P>{"Sortl scores you against par — the minimum number of moves needed to solve the day's puzzle. The puzzle is always solvable cleanly, but there are usually messier routes that technically work too, so the real challenge isn't just finishing — it's finishing without wasted pours."}</P>
                  <P>Matching or beating par earns the top tier. Every move over par nudges your label down. Undo is there if you back yourself into a corner, but a tidy first solve is what earns a Flawless Sort.</P>
                  <div style={{ marginTop: "0.5rem", display: "grid", gridTemplateColumns: "7rem 1fr", rowGap: "0.35rem" }}>
                    {[
                      ["≤ par",    "FLAWLESS SORT"],
                      ["par +1–3", "CLEAN SORT"],
                      ["par +4–8", "DECENT SORT"],
                      ["par +9+",  "MESSY SORT"],
                      ["stuck",    "UNSORTED"],
                    ].map(([range, label]) => (
                      <Fragment key={range}>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#c45a3a", letterSpacing: "0.06em", alignSelf: "baseline", paddingTop: 2 }}>{range}</span>
                        <span style={{ fontSize: 15 }}>{label}</span>
                      </Fragment>
                    ))}
                  </div>
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>Tips</SectionHeader>
                <Body>
                  {[
                    "Start by identifying which tubes are closest to being sorted — one or two moves away.",
                    "Empty tubes are valuable — use them as temporary storage, not just final destinations.",
                    "If you get stuck, use Undo rather than Restart to save moves.",
                    "In harder levels, you often need to \"unpack\" a tube before you can sort it properly.",
                    "Your streak resets if you miss a day — come back every day to keep it alive.",
                  ].map((tip, i) => (
                    <p key={i} style={{ marginBottom: "0.75rem" }}>→ {tip}</p>
                  ))}
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>One Puzzle Per Day</SectionHeader>
                <Body>
                  <P>{"There's no \"play again\" for the daily puzzle. One puzzle, one attempt, same for everyone. Want more? Switch to Levels mode for 300 puzzles at your own pace, from easy 4-tube puzzles to expert 7-tube challenges."}</P>
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>Free, Forever</SectionHeader>
                <Body>
                  <P>{"No account. No subscription. No ads mid-solve. Sortl is completely free to play and always will be — it runs entirely in your browser, and your streak and stats are saved locally on your device."}</P>
                  <P>{"It's part of Stoop, a small collection of free daily browser games built by one person who thinks the internet is better with little puzzles in it. Open it, sort your tubes, and come back tomorrow."}</P>
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>Why Liquid Sort?</SectionHeader>
                <Body>
                  <P>{"Liquid sort is one of the most satisfying logic puzzles because the rules click into place in seconds but mastery takes much longer. Every pour is permanent for the duration of a round — there's no shuffling layers around freely — so each move commits you to a path. That forward pressure is what makes it work as a daily game. You get one shot at the puzzle, the same one as everyone else in the world, and then you wait until tomorrow. That combination of constraint and ritual is what keeps it interesting."}</P>
                </Body>
              </section>

              <section className="mb-12">
                <SectionHeader>How Sortl Compares</SectionHeader>
                <Body>
                  <P>{"Most daily puzzles involve a word, a photo, or a list you're slowly narrowing down through guesses. Sortl is different: there's nothing to guess. Either you find the right sequence of pours or you don't — luck plays no role at all. That puts it closer to Sudoku or nonograms than to Wordle. If you enjoy puzzles where the solution is a logical fact rather than a lucky deduction, this is the format for you. One board, one solution, no randomness, same for everyone."}</P>
                </Body>
              </section>

              <section>
                <SectionHeader>Play More Stoop Games</SectionHeader>
                <Body>
                  <P>Sortl is part of Stoop, a small network of free daily browser games. Each one runs a single puzzle per day — same schedule, no accounts, no ads. If you liked this one: geography at dailyguessr.app, flags at flagguessr.app, cocktails at cocktailguessr.app, colour matching at palette.stoop.games, and a floral puzzle at bloom.stoop.games. All free, all daily, all reset at midnight UTC.</P>
                </Body>
              </section>
            </>
          );
        })()}
      </div>
    </>
  );
}
