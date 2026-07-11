'use client';

import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, BarChart3, Megaphone } from 'lucide-react';
import { useI18n } from '@/lib/i18n-context';
import { useDbTranslation } from '@/hooks/useDbTranslation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

interface CookieConfig {
  showCookieBanner: boolean;
  cookieBannerText: string;
  cookieAcceptText: string;
  cookieDeclineText: string;
  cookieTecnici: boolean;
  cookieAnalitici: boolean;
  cookieMarketing: boolean;
}

const DEFAULT_CONFIG: CookieConfig = {
  showCookieBanner: true,
  cookieBannerText: 'Questo sito utilizza cookie per migliorare la tua esperienza. Seleziona i tipi di cookie che desideri attivare.',
  cookieAcceptText: 'Salva preferenze',
  cookieDeclineText: 'Rifiuta tutto',
  cookieTecnici: true,
  cookieAnalitici: true,
  cookieMarketing: true,
};

export default function CookieBanner() {
  const { t } = useI18n();
  const dbTr = useDbTranslation();
  const [config, setConfig] = useState<CookieConfig>(DEFAULT_CONFIG);
  const [visible, setVisible] = useState(false);
  const [tecnici, setTecnici] = useState(true);
  const [analitici, setAnalitici] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const existingConsent = localStorage.getItem('cookie-consent');
    if (existingConsent) {
      try {
        const parsed = JSON.parse(existingConsent);
        window.__cookieConsent = parsed;
      } catch {
        localStorage.removeItem('cookie-consent');
      }
      return;
    }

    fetch('/api/company-data-public')
      .then((r) => r.json())
      .then((data) => {
        const show = data.showCookieBanner ?? true;
        const cfg = {
          showCookieBanner: show,
          cookieBannerText: data.cookieBannerText || DEFAULT_CONFIG.cookieBannerText,
          cookieAcceptText: data.cookieAcceptText || DEFAULT_CONFIG.cookieAcceptText,
          cookieDeclineText: data.cookieDeclineText || DEFAULT_CONFIG.cookieDeclineText,
          cookieTecnici: data.cookieTecnici ?? true,
          cookieAnalitici: data.cookieAnalitici ?? true,
          cookieMarketing: data.cookieMarketing ?? true,
        };
        setConfig(cfg);
        setAnalitici(cfg.cookieAnalitici);
        setMarketing(cfg.cookieMarketing);
        // Registra testi DB per traduzione
        dbTr.register({
          'cookie.bannerText': cfg.cookieBannerText,
          'cookie.acceptText': cfg.cookieAcceptText,
          'cookie.declineText': cfg.cookieDeclineText,
        });
        if (show) {
          setVisible(true);
        }
      })
      .catch(() => {
        setVisible(true);
      });
  }, []);

  const saveConsent = () => {
    const consent = {
      accepted: true,
      date: new Date().toISOString(),
      tecnici,
      analitici,
      marketing,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    window.__cookieConsent = consent;
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
  };

  const rejectAll = () => {
    const consent = {
      accepted: false,
      date: new Date().toISOString(),
      tecnici: true,
      analitici: false,
      marketing: false,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    window.__cookieConsent = consent;
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
  };

  const acceptAll = () => {
    setTecnici(true);
    setAnalitici(true);
    setMarketing(true);
    const consent = {
      accepted: true,
      date: new Date().toISOString(),
      tecnici: true,
      analitici: true,
      marketing: true,
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    window.__cookieConsent = consent;
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: consent }));
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Testo informativo */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 text-[var(--primary)] mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium mb-1">{t('cookie.title')}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {dbTr.t('cookie.bannerText', config.cookieBannerText)}
              </p>
            </div>
          </div>
        </div>

        {/* Switch per tipologie di cookie */}
        <div className="px-5 sm:px-6 pb-4 space-y-3">
          {/* Tecnici - sempre attivo, non disabilitabile */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4.5 w-4.5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">{t('cookie.tecnici')}</p>
                <p className="text-xs text-gray-400">{t('cookie.tecniciDesc')}</p>
              </div>
            </div>
            <Switch checked={true} disabled className="opacity-70" />
          </div>

          {/* Analitici */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">{t('cookie.analitici')}</p>
                <p className="text-xs text-gray-400">{t('cookie.analiticiDesc')}</p>
              </div>
            </div>
            <Switch
              checked={analitici}
              onCheckedChange={setAnalitici}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Megaphone className="h-4.5 w-4.5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-800">{t('cookie.marketing')}</p>
                <p className="text-xs text-gray-400">{t('cookie.marketingDesc')}</p>
              </div>
            </div>
            <Switch
              checked={marketing}
              onCheckedChange={setMarketing}
            />
          </div>
        </div>

        {/* Link e pulsanti */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="flex gap-3 text-xs text-gray-400 mb-4">
            <Link href="/cookie-policy" className="hover:text-[var(--primary)] underline">{t('cookie.cookie')}</Link>
            <Link href="/privacy-policy" className="hover:text-[var(--primary)] underline">{t('cookie.privacy')}</Link>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="flex-1 rounded-full px-4"
            >
              {config.cookieDeclineText ? dbTr.t('cookie.declineText', config.cookieDeclineText) : t('cookie.rejectAll')}
            </Button>
            <Button
              size="sm"
              onClick={saveConsent}
              className="flex-1 rounded-full px-4 bg-[var(--primary)] hover:opacity-90 text-white"
            >
              {config.cookieAcceptText ? dbTr.t('cookie.acceptText', config.cookieAcceptText) : t('cookie.acceptAll')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}