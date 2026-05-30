export default function StoopFooter() {
  const links = [
    { name: "DailyGuessr",    url: "https://dailyguessr.stoop.games" },
    { name: "FlagGuessr",     url: "https://flagguessr.stoop.games" },
    { name: "CocktailGuessr", url: "https://cocktailguessr.stoop.games" },
    { name: "Palette",        url: "https://palette.stoop.games" },
    { name: "Bloom",          url: "https://bloom.stoop.games" },
    { name: "Sortl",          url: "/" },
  ];

  return (
    <footer className="mt-auto border-t border-[--rule] bg-[--paper-2] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            className="text-lg text-[--ink-faded]"
            style={{ fontFamily: "var(--font-caprasimo)" }}
          >
            Stoop Games
          </span>
          <div className="flex flex-wrap justify-center gap-4">
            {links.map(l => (
              <a
                key={l.name}
                href={l.url}
                className="text-sm text-[--ink-faded] hover:text-[--ink] transition-colors"
              >
                {l.name}
              </a>
            ))}
          </div>
          <p className="text-xs text-[--ink-faded]">© {new Date().getFullYear()} Stoop Games</p>
        </div>
      </div>
    </footer>
  );
}
