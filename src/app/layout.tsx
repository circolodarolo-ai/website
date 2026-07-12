import type { Metadata } from 'next';
import { db } from '@/lib/db';

import CookieBanner from '@/components/restaurant/CookieBanner';
import Providers from '@/components/Providers';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.labellatavola.it';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'La Bella Tavola | Autentica Cucina Italiana dal 1985',
    template: '%s | La Bella Tavola',
  },
  description: 'Ristorante La Bella Tavola - Autentica cucina italiana nel cuore di Milano. Prenota il tuo tavolo, scopri il nostro menu e gli eventi speciali.',
  keywords: ['ristorante', 'cucina italiana', 'Milano', 'La Bella Tavola', 'prenotazione', 'menu', 'ristorante Milano', 'cucina milanese'],
  authors: [{ name: 'La Bella Tavola' }],
  creator: 'La Bella Tavola',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'La Bella Tavola | Autentica Cucina Italiana',
    description: 'Tradizione, passione e sapori genuini nel cuore di Milano. Prenota il tuo tavolo.',
    type: 'website',
    locale: 'it_IT',
    url: SITE_URL,
    siteName: 'La Bella Tavola',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'La Bella Tavola | Autentica Cucina Italiana',
    description: 'Tradizione, passione e sapori genuini nel cuore di Milano.',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'it': SITE_URL,
      'en': `${SITE_URL}/?lang=en`,
      'fr': `${SITE_URL}/?lang=fr`,
      'de': `${SITE_URL}/?lang=de`,
      'es': `${SITE_URL}/?lang=es`,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headingFont = 'Playfair Display';
  let bodyFont = 'Inter';
  let primaryColor = '#ea580c';
  let primaryForeground = '#ffffff';
  let secondaryColor = '#0d9488';
  let footerBgColor = '#111827';
  let footerTextColor = '#d1d5db';
  let sectionBgColor = '#f9fafb';
  let socialBtnColor = '#ea580c';
  let settingsBtnColor = '#dc2626';
  let prenotaBtnColor = '#ea580c';
  let prenotaSectionBgColor = '#ea580c';
  let adSenseId = '';

  try {
    const info = await db.siteInfo.findFirst() as any;
    if (info?.headingFont) headingFont = info.headingFont;
    if (info?.bodyFont) bodyFont = info.bodyFont;
    if (info?.primaryColor) primaryColor = info.primaryColor;
    if (info?.primaryForeground) primaryForeground = info.primaryForeground;
    if (info?.secondaryColor) secondaryColor = info.secondaryColor;
    if (info?.footerBgColor) footerBgColor = info.footerBgColor;
    if (info?.footerTextColor) footerTextColor = info.footerTextColor;
    if (info?.sectionBgColor) sectionBgColor = info.sectionBgColor;
    if (info?.socialBtnColor) socialBtnColor = info.socialBtnColor;
    if (info?.settingsBtnColor) settingsBtnColor = info.settingsBtnColor;
    if (info?.prenotaBtnColor) prenotaBtnColor = info.prenotaBtnColor;
    if (info?.prenotaSectionBgColor) prenotaSectionBgColor = info.prenotaSectionBgColor;
  } catch {
    // fallback ai default
  }

  // Carica AdSense ID da CompanyData
  try {
    const companyData = await db.companyData.findFirst({
      select: { adSenseId: true },
    });
    if (companyData?.adSenseId) adSenseId = companyData.adSenseId;
  } catch {
    // AdSense non configurato
  }

  const headingEncoded = headingFont.replace(/ /g, '+');
  const bodyEncoded = bodyFont.replace(/ /g, '+');
  const fontsUrl = `https://fonts.googleapis.com/css2?family=${headingEncoded}:wght@400;500;600;700&family=${bodyEncoded}:wght@300;400;500;600;700&display=swap`;

  return (
    <html
      lang="it"
      suppressHydrationWarning
      style={{
        '--font-heading': `"${headingFont}", Georgia, serif`,
        '--font-body': `"${bodyFont}", system-ui, sans-serif`,
        '--primary': primaryColor,
        '--primary-foreground': primaryForeground,
        '--secondary-custom': secondaryColor,
        '--footer-bg': footerBgColor,
        '--footer-text': footerTextColor,
        '--section-bg': sectionBgColor,
        '--social-btn-color': socialBtnColor,
        '--settings-btn-color': settingsBtnColor,
        '--prenota-btn-color': prenotaBtnColor,
        '--prenota-section-bg': prenotaSectionBgColor,
      } as React.CSSProperties}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontsUrl} rel="stylesheet" />
        {/* JSON-LD Structured Data per il ristorante */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'La Bella Tavola',
              description: 'Autentica cucina italiana nel cuore di Milano',
              url: SITE_URL,
              servesCuisine: 'Cucina italiana',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Milano',
                addressCountry: 'IT',
              },
              hasMenu: { '@type': 'Menu', url: `${SITE_URL}/menu` },
              acceptsReservations: true,
            }),
          }}
        />
        {adSenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="antialiased bg-white text-foreground">
        <Providers>
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}