"use client";

const NAV_GAMES = [
  { name: "DailyGuessr",    url: "https://dailyguessr.stoop.games" },
  { name: "FlagGuessr",     url: "https://flagguessr.stoop.games" },
  { name: "CocktailGuessr", url: "https://cocktailguessr.stoop.games" },
  { name: "Palette",        url: "https://palette.stoop.games" },
  { name: "Bloom",          url: "https://bloom.stoop.games" },
  { name: "Sortl",          url: "/", current: true },
];

export default function StoopNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[--rule] bg-[--paper]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {/* Stoop wordmark */}
        <a
          href="https://stoop.games"
          className="shrink-0 mr-3 text-sm font-semibold text-[--ink-faded] hover:text-[--ink] transition-colors"
          style={{ fontFamily: "var(--font-caprasimo)" }}
        >
          Stoop
        </a>
        <span className="shrink-0 text-[--rule] mr-3">|</span>
        {NAV_GAMES.map(g => (
          <a
            key={g.name}
            href={g.url}
            className={[
              "shrink-0 px-3 py-1 rounded-lg text-sm transition-colors whitespace-nowrap",
              g.current
                ? "bg-[--terracotta] text-white font-semibold"
                : "text-[--ink-soft] hover:text-[--ink] hover:bg-[--paper-2]",
            ].join(" ")}
          >
            {g.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
