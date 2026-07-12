'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';

// Validate hex color before parsing
function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0,
  ];
}
function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function darkenColor(hex: string, amount: number): string {
  try {
    if (!isValidHex(hex)) return hex;
    const [r, g, b] = parseHex(hex);
    return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
  } catch { return hex; }
}
function lightenColor(hex: string, amount: number): string {
  try {
    if (!isValidHex(hex)) return hex;
    const [r, g, b] = parseHex(hex);
    return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  } catch { return hex; }
}

interface SiteTheme {
  primaryColor: string;
  primaryForeground: string;
  headingFont: string;
  bodyFont: string;
}

export default function ThemeInjector({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<SiteTheme | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/site-info');
      if (!res.ok) return;
      const data = await res.json();
      const pc = (typeof data.primaryColor === 'string' && isValidHex(data.primaryColor)) ? data.primaryColor : '#b91c1c';
      const pf = (typeof data.primaryForeground === 'string' && isValidHex(data.primaryForeground)) ? data.primaryForeground : '#ffffff';
      setTheme({
        primaryColor: pc,
        primaryForeground: pf,
        headingFont: typeof data.headingFont === 'string' ? data.headingFont : 'Inter',
        bodyFont: typeof data.bodyFont === 'string' ? data.bodyFont : 'Inter',
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchTheme();
  }, [fetchTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => fetchTheme();
    try {
      window.addEventListener('site-theme-updated', handler);
      return () => { try { window.removeEventListener('site-theme-updated', handler); } catch {} };
    } catch { return; }
  }, [fetchTheme]);

  if (!mounted || !theme) return <>{children}</>;

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
  const c = theme.primaryColor;

  const css = `
    :root {
      --site-color: ${c};
      --site-color-hover: ${darkenColor(c, 0.22)};
      --site-color-soft: ${darkenColor(c, 0.10)};
      --site-color-light: ${lightenColor(c, 0.92)};
      --site-color-lighter: ${lightenColor(c, 0.85)};
      --site-color-border: ${lightenColor(c, 0.75)};
      ${headingFamily ? `--font-heading: ${headingFamily};` : ''}
      ${bodyFamily ? `--font-body: ${bodyFamily};` : ''}
    }
    @supports (color: color-mix(in srgb, red 50%, blue)) {
      :root {
        --site-color-hover: color-mix(in srgb, ${c} 78%, black);
        --site-color-soft: color-mix(in srgb, ${c} 90%, black);
        --site-color-light: color-mix(in srgb, ${c} 8%, white);
        --site-color-lighter: color-mix(in srgb, ${c} 15%, white);
        --site-color-border: color-mix(in srgb, ${c} 25%, white);
      }
    }
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