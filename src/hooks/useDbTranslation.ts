'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n-context';

/**
 * Hook per tradurre contenuti dinamici dal DB usando la TranslationCache.
 *
 * Uso:
 *   const tr = useDbTranslation();
 *   // Quando i dati dal DB sono pronti:
 *   tr.register({ 'hero.title': siteInfo.heroTitle, 'hero.subtitle': siteInfo.heroSubtitle });
 *   // Poi usa: tr.t('hero.title') → restituisce la traduzione se in cache, altrimenti l'originale
 *
 * Il flusso:
 * 1. Il componente registra i testi da tradurre con register()
 * 2. Se la lingua non è 'it', l'hook chiama /api/translate-batch
 * 3. Le traduzioni dalla cache DB vengono memorizzate e restituite da t()
 */
export function useDbTranslation() {
  const { locale } = useI18n();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const pendingRef = useRef<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Registra testi da tradurre. Si accumulano e vengono inviati in batch dopo 50ms di debounce.
  const register = useCallback((texts: Record<string, string | null | undefined>) => {
    // Filtra null/undefined/vuoti
    const filtered: Record<string, string> = {};
    for (const [key, text] of Object.entries(texts)) {
      if (text && text.trim()) {
        filtered[key] = text;
      }
    }

    if (Object.keys(filtered).length === 0) return;

    // Accumula
    pendingRef.current = { ...pendingRef.current, ...filtered };

    // Debounce: aspetta 50ms prima di inviare la richiesta
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchTranslations(pendingRef.current);
      pendingRef.current = {};
    }, 50);
  }, [locale]);

  const fetchTranslations = useCallback(async (texts: Record<string, string>) => {
    if (locale === 'it' || Object.keys(texts).length === 0) {
      setTranslations({});
      return;
    }

    try {
      const items = Object.entries(texts).map(([key, text]) => ({ key, text }));
      const res = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, texts: items }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslations(prev => ({ ...prev, ...data.translations }));
      }
    } catch {
      // Silenzioso — restituisce i testi originali
    }
  }, [locale]);

  // Reset traduzioni quando cambia lingua
  useEffect(() => {
    setTranslations({});
  }, [locale]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Funzione t(): restituisce la traduzione se disponibile, altrimenti il testo originale
  const t = useCallback((key: string, fallback?: string): string => {
    if (translations[key]) return translations[key];
    return fallback || pendingRef.current[key] || key;
  }, [translations]);

  return { t, register, translations };
}