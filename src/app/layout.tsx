import type { Metadata } from "next";
import { Caprasimo, Newsreader, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import StoopNav from "./components/StoopNav";
import StoopFooter from "./components/StoopFooter";
import "./globals.css";

const caprasimo = Caprasimo({
  weight: "400",
  variable: "--font-caprasimo",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://sortl.stoop.games";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sortl — Daily liquid sort puzzle",
  description: "Sort coloured liquids into pure test tubes. A new puzzle every day.",
  keywords: ["liquid sort", "puzzle game", "daily puzzle", "brain game", "Stoop Games"],
  authors: [{ name: "Stoop Games", url: "https://stoop.games" }],
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Stoop Games",
    title: "Sortl — Daily liquid sort puzzle",
    description: "Sort coloured liquids into pure test tubes. A new puzzle every day.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Sortl puzzle game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sortl — Daily liquid sort puzzle",
    description: "Sort coloured liquids into pure test tubes. A new puzzle every day.",
    images: ["/opengraph-image"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sortl",
  url: SITE_URL,
  description: "Sort coloured liquids into pure test tubes. A new puzzle every day.",
  applicationCategory: "GameApplication",
  genre: "Puzzle",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: "Stoop Games", url: "https://stoop.games" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caprasimo.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[--paper] text-[--ink] antialiased">
        <StoopNav currentGame="sortl" />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <StoopFooter currentGame="sortl" />
        <nav aria-label="More Stoop games" style={{ borderTop: '1px dashed rgba(42,31,21,0.18)', background: '#f3e9d6', padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--mono, "JetBrains Mono", monospace)', fontSize: 11, color: '#8a7355', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>More Stoop games</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 24px' }}>
            <li><a href="https://dailyguessr.app" style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 14, color: '#5a4632', textDecoration: 'none' }}>DailyGuessr</a></li>
            <li><a href="https://flagguessr.app" style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 14, color: '#5a4632', textDecoration: 'none' }}>FlagGuessr</a></li>
            <li><a href="https://cocktailguessr.app" style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 14, color: '#5a4632', textDecoration: 'none' }}>CocktailGuessr</a></li>
            <li><a href="https://palette.stoop.games" style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 14, color: '#5a4632', textDecoration: 'none' }}>Palette</a></li>
            <li><a href="https://bloom.stoop.games" style={{ fontFamily: 'var(--serif, Georgia, serif)', fontSize: 14, color: '#5a4632', textDecoration: 'none' }}>Bloom</a></li>
          </ul>
        </nav>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            src="https://analytics.stoop.games/script.js"
            data-website-id="58d57aa4-6898-4152-b1a7-4d5a109132ee"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
