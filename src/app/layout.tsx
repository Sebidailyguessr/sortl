import type { Metadata } from "next";
import { Caprasimo, Newsreader, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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
  // Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel env vars to activate
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
        {children}
        {/* Umami analytics — set NEXT_PUBLIC_UMAMI_WEBSITE_ID in Vercel env vars */}
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
