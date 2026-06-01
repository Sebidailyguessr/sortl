import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/"
        style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--terracotta)', textDecoration: 'none' }}
        className="inline-block mb-8"
      >
        ← Back to game
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink)', marginBottom: 24 }}>
        Contact
      </h1>

      <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
        Have a question, suggestion, or found a bug? Reach out at{' '}
        <a
          href="mailto:hello@stoop.games"
          style={{ color: 'var(--terracotta)', textDecoration: 'none' }}
        >
          hello@stoop.games
        </a>
      </p>

      <h2 className="seo-h2" style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--ink-faded)', fontWeight: 400, marginTop: 40, marginBottom: 16 }}>
        <span aria-hidden="true">——</span>
        More games on Stoop
      </h2>
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'DailyGuessr', href: 'https://dailyguessr.app', desc: 'Guess the place from a street view photo' },
          { label: 'FlagGuessr', href: 'https://flagguessr.app', desc: 'Guess the country from its flag' },
          { label: 'CocktailGuessr', href: 'https://cocktailguessr.app', desc: 'Identify the cocktail from a zoomed image' },
          { label: 'Palette', href: 'https://palette.stoop.games', desc: 'Daily colour-matching puzzle' },
          { label: 'Bloom', href: 'https://bloom.stoop.games', desc: 'Daily flood-fill colour puzzle' },
        ].map(g => (
          <li key={g.href} style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)' }}>
            <a href={g.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)', textDecoration: 'none' }}>
              {g.label}
            </a>
            {' '}— {g.desc}
          </li>
        ))}
      </ul>
    </div>
  )
}
