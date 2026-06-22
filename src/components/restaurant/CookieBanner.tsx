'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CookieConfig {
  showCookieBanner: boolean;
  cookieBannerText: string | null;
  cookieAcceptText: string | null;
  cookieDeclineText: string | null;
  cookieTecnici: boolean;
  cookieAnalitici: boolean;
  cookieMarketing: boolean;
}

const DEFAULT_CONFIG: CookieConfig = {
  showCookieBanner: true,
  cookieBannerText: 'Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su "Autorizzo", accetti l\'uso dei cookie.',
  cookieAcceptText: 'Autorizzo',
  cookieDeclineText: 'Annulla',
  cookieTecnici: true,
  cookieAnalitici: true,
  cookieMarketing: true,
};

export default function CookieBanner() {
  const [config, setConfig] = useState<CookieConfig>(DEFAULT_CONFIG);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Fetch cookie config from DB
    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          showCookieBanner: data.showCookieBanner ?? true,
          cookieBannerText: data.cookieBannerText || DEFAULT_CONFIG.cookieBannerText,
          cookieAcceptText: data.cookieAcceptText || DEFAULT_CONFIG.cookieAcceptText,
          cookieDeclineText: data.cookieDeclineText || DEFAULT_CONFIG.cookieDeclineText,
          cookieTecnici: data.cookieTecnici ?? true,
          cookieAnalitici: data.cookieAnalitici ?? true,
          cookieMarketing: data.cookieMarketing ?? true,
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

    // Check if user already gave consent
    const existingConsent = localStorage.getItem('cookie-consent');
    if (existingConsent) {
      const parsed = JSON.parse(existingConsent);
      // Apply consent state to window for other components to read
      window.__cookieConsent = parsed;
      setVisible(false);
    }
  }, []);

  // Only show banner after config is loaded and no consent given
  useEffect(() => {
    if (loaded && !localStorage.getItem('cookie-consent') && config.showCookieBanner) {
      setVisible(true);
    }
  }, [loaded, config.showCookieBanner]);

  const saveConsent = (accepted: boolean) => {
    const consent = {
      accepted,
      date: new Date().toISOString(),
      tecnici: true, // always on
      analitici: accepted ? config.cookieAnalitici : false,
      marketing: accepted ? config.cookieMarketing : false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    window.__cookieConsent = consent;
    setVisible(false);

    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="h-6 w-6 text-red-700 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 leading-relaxed">
            {config.cookieBannerText}
          </p>
          <div className="flex gap-3 text-xs text-gray-400 mt-1">
            <Link href="/cookie-policy" className="hover:text-red-700 underline">Cookie Policy</Link>
            <Link href="/privacy-policy" className="hover:text-red-700 underline">Privacy Policy</Link>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveConsent(false)}
            className="flex-1 sm:flex-initial rounded-full px-4"
          >
            {config.cookieDeclineText}
          </Button>
          <Button
            size="sm"
            onClick={() => saveConsent(true)}
            className="flex-1 sm:flex-initial bg-red-700 hover:bg-red-800 text-white rounded-full px-4"
          >
            {config.cookieAcceptText}
          </Button>
        </div>
      </div>
    </div>
  );
}