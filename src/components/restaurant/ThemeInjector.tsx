'use client';

import { useState, useEffect, useCallback } from 'react';

interface SiteTheme {
  primaryColor: string;
  primaryForeground: string;
  headingFont: string;
  bodyFont: string;
}

export default function ThemeInjector({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme | null>(null);

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/site-info');
      const data = await res.json();
      setTheme({
        primaryColor: data.primaryColor || '#b91c1c',
        primaryForeground: data.primaryForeground || '#ffffff',
        headingFont: data.headingFont || 'Inter',
        bodyFont: data.bodyFont || 'Inter',
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchTheme(); }, [fetchTheme]);

  // Listen for theme updates from admin
  useEffect(() => {
    const handler = () => fetchTheme();
    window.addEventListener('site-theme-updated', handler);
    return () => window.removeEventListener('site-theme-updated', handler);
  }, [fetchTheme]);

  if (!theme) return <>{children}</>;

  // Build Google Fonts URL
  const fontsToLoad: string[] = [];
  if (theme.headingFont && theme.headingFont !== 'Inter') {
    fontsToLoad.push(theme.headingFont.replace(/ /g, '+') + ':wght@400;500;600;700');
  }
  if (theme.bodyFont && theme.bodyFont !== 'Inter') {
    const encoded = theme.bodyFont.replace(/ /g, '+') + ':wght@300;400;500;600;700';
    if (!fontsToLoad.includes(encoded)) fontsToLoad.push(encoded);
  }

  const fontsUrl = fontsToLoad.length > 0
    ? `https://fonts.googleapis.com/css2?family=${fontsToLoad.join('&family=')}&display=swap`
    : null;

  const headingFamily = theme.headingFont !== 'Inter' ? `'${theme.headingFont}', sans-serif` : '';
  const bodyFamily = theme.bodyFont !== 'Inter' ? `'${theme.bodyFont}', sans-serif` : '';

  const css = `
    :root {
      --site-color: ${theme.primaryColor};
      --site-color-hover: color-mix(in srgb, ${theme.primaryColor} 78%, black);
      --site-color-soft: color-mix(in srgb, ${theme.primaryColor} 90%, black);
      --site-color-light: color-mix(in srgb, ${theme.primaryColor} 8%, white);
      --site-color-lighter: color-mix(in srgb, ${theme.primaryColor} 15%, white);
      --site-color-border: color-mix(in srgb, ${theme.primaryColor} 25%, white);
      ${headingFamily ? `--font-heading: ${headingFamily};` : ''}
      ${bodyFamily ? `--font-body: ${bodyFamily};` : ''}
    }

    /* === Color overrides === */
    .bg-red-700 { background-color: var(--site-color) !important; }
    .text-red-700 { color: var(--site-color) !important; }
    .bg-red-800 { background-color: var(--site-color-hover) !important; }
    .hover\\:bg-red-800:hover { background-color: var(--site-color-hover) !important; }
    .hover\\:bg-red-700:hover { background-color: var(--site-color) !important; }
    .hover\\:text-red-700:hover { color: var(--site-color) !important; }
    .hover\\:text-red-800:hover { color: var(--site-color-hover) !important; }
    .bg-red-50 { background-color: var(--site-color-light) !important; }
    .hover\\:bg-red-50:hover { background-color: var(--site-color-light) !important; }
    .bg-red-100 { background-color: var(--site-color-lighter) !important; }
    .border-red-100 { border-color: var(--site-color-lighter) !important; }
    .hover\\:border-red-100:hover { border-color: var(--site-color-lighter) !important; }
    .border-red-200 { border-color: var(--site-color-border) !important; }
    .hover\\:border-red-200:hover { border-color: var(--site-color-border) !important; }
    .bg-red-600 { background-color: var(--site-color-soft) !important; }
    .hover\\:bg-red-600:hover { background-color: var(--site-color) !important; }
    .text-red-600 { color: var(--site-color-soft) !important; }
    .ring-red-700 { --tw-ring-color: var(--site-color) !important; }
    .focus\\:ring-red-700:focus { --tw-ring-color: var(--site-color) !important; }

    /* === Font overrides === */
    ${bodyFamily ? `body, .font-sans { font-family: var(--font-body) !important; }` : ''}
    h1, h2, h3, h4, h5, h6,
    .text-3xl, .text-4xl, .text-5xl {
      font-family: var(--font-heading, var(--font-body, inherit)) !important;
    }
  `;

  return (
    <>
      {fontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href={fontsUrl} rel="stylesheet" />
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </>
  );
}