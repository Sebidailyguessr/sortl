import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/"
        style={{ fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--terracotta)', textDecoration: 'none' }}
        className="inline-block mb-8"
      >
        ← Back to game
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink)', marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--ink-faded)', marginBottom: 32 }}>
        Last updated: May 2026
      </p>

      <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
        Sortl is operated by <strong>Sebastian Racławski</strong>.
      </p>

      <h2 className="seo-h2" style={{ marginTop: 32 }}>Analytics</h2>
      <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
        This site uses{' '}
        <a href="https://umami.is" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--terracotta)', textDecoration: 'none' }}>
          Umami
        </a>
        {' '}for privacy-friendly analytics. Umami does not use cookies and collects no personally
        identifiable information. All analytics data is anonymous.
      </p>

      <h2 className="seo-h2" style={{ marginTop: 32 }}>Local Storage</h2>
      <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 16 }}>
        Game progress and history are stored locally in your browser using localStorage. No data
        is sent to our servers.
      </p>

      <h2 className="seo-h2" style={{ marginTop: 32 }}>Contact</h2>
      <p style={{ fontFamily: 'var(--serif)', color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: 0 }}>
        Questions about this policy?{' '}
        <a href="mailto:hello@stoop.games" style={{ color: 'var(--terracotta)', textDecoration: 'none' }}>
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
