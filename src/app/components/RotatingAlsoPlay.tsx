"use client";
import { useEffect, useState } from "react";

const GAMES = [
  { name: "DailyGuessr",    url: "https://dailyguessr.stoop.games",    emoji: "📍" },
  { name: "FlagGuessr",     url: "https://flagguessr.stoop.games",     emoji: "🚩" },
  { name: "CocktailGuessr", url: "https://cocktailguessr.stoop.games", emoji: "🍹" },
  { name: "Palette",        url: "https://palette.stoop.games",        emoji: "🎨" },
  { name: "Bloom",          url: "https://bloom.stoop.games",          emoji: "🌸" },
];

export default function RotatingAlsoPlay() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % GAMES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const game = GAMES[idx];

  return (
    <div>
      <div className="text-[10px] font-semibold text-[--ink-faded] uppercase tracking-widest mb-2">
        Also Play
      </div>
      <a
        href={game.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[--rule] hover:bg-[--paper-2] transition-colors"
      >
        <span className="text-lg">{game.emoji}</span>
        <span className="text-sm font-semibold text-[--ink]">{game.name}</span>
        <span className="ml-auto text-[--ink-faded] text-xs">→</span>
      </a>
      <div className="flex gap-1 mt-2 justify-center">
        {GAMES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-[--terracotta]" : "bg-[--ink-faded]/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
