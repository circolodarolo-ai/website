'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  flag: string;
}

// Mappa codice lingua → codice paese per le bandiere
const FLAG_COUNTRY: Record<string, string> = {
  it: 'it',
  en: 'gb',
  fr: 'fr',
  de: 'de',
  es: 'es',
};

function FlagIcon({ code, size = 20 }: { code: string; size?: number }) {
  const country = FLAG_COUNTRY[code] || code;
  const [error, setError] = useState(false);

  // Fallback: sigla stilizzata se l'immagine non carica
  if (error) {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm font-bold text-[10px] leading-none text-white"
        style={{
          width: size * 1.25,
          height: size * 0.9,
          backgroundColor: '#6b7280',
        }}
      >
        {code.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${country}.png`}
      alt={`${code} flag`}
      width={size}
      height={Math.round(size * 0.75)}
      className="object-cover rounded-sm"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export default function LanguageSelector() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [open, setOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('it');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carica lingue attive dal DB
    fetch('/api/i18n-settings')
      .then(r => r.json())
      .then(data => {
        if (data.active && data.languages?.length > 1) {
          setLanguages(data.languages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Leggi lingua salvata
    const saved = localStorage.getItem('user-locale') || 'it';
    setCurrentLocale(saved);
  }, []);

  // Chiudi dropdown al click fuori
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Non mostrare nulla durante il caricamento iniziale né se non ci sono lingue
  if (loading || languages.length <= 1) return null;

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  const switchLocale = (newLocale: string) => {
    setCurrentLocale(newLocale);
    localStorage.setItem('user-locale', newLocale);
    document.documentElement.lang = newLocale;
    setOpen(false);

    // Notifica il contesto i18n del cambio lingua (senza reload)
    window.dispatchEvent(new CustomEvent('locale-change', { detail: { locale: newLocale } }));
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 hover:bg-black/5"
        title="Cambia lingua"
      >
        <FlagIcon code={currentLang?.code || 'it'} size={20} />
        <span className="hidden sm:inline text-xs">{currentLang?.code?.toUpperCase()}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left ${
                currentLocale === lang.code
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FlagIcon code={lang.code} size={20} />
              <span>{lang.label}</span>
              {currentLocale === lang.code && (
                <span className="ml-auto text-xs text-gray-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}