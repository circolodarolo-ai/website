// Sistema di traduzione gratuito con cache nel DB
// Usa Google Translate (unofficial) come primaria, MyMemory come fallback

import { db } from './db';

const SUPPORTED_LOCALES = ['en', 'fr', 'de', 'es'] as const;
export type Locale = 'it' | (typeof SUPPORTED_LOCALES)[number];

// Mappa codice lingua → codice per le API di traduzione
const LOCALE_TO_CODE: Record<string, string> = {
  en: 'en',
  fr: 'fr',
  de: 'de',
  es: 'es',
  it: 'it',
};

// Cache in memoria per evitare query ripetute nella stessa richiesta
const memoryCache = new Map<string, string>();

// Delay utility per evitare rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Traduce un testo nella lingua richiesta, usando cache DB.
 * Se la traduzione è già in cache (DB o memoria), la restituisce direttamente.
 */
export async function translateText(text: string, locale: Locale): Promise<string> {
  if (!text || !text.trim()) return text;
  if (locale === 'it') return text; // l'italiano è la lingua base

  const cacheKey = `${locale}:${text}`;

  // 1. Controlla cache in memoria
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Controlla cache nel DB
  try {
    const cached = await db.translationCache.findUnique({
      where: { chiave_locale: { chiave: text, locale } },
    });
    if (cached) {
      // Se la traduzione in cache è identica all'originale, è una traduzione fallita precedentemente
      // Ignoriamola e ritentiamo la traduzione
      if (cached.testoTradotto !== cached.testoOriginale) {
        memoryCache.set(cacheKey, cached.testoTradotto);
        return cached.testoTradotto;
      }
    }
  } catch {
    // Se il DB non ha ancora la tabella, ignora
  }

  // 3. Traduci con API
  const translated = await callTranslationAPI(text, locale);

  // 4. Salva in cache DB SOLO se la traduzione è effettivamente diversa dall'originale
  if (translated !== text) {
    try {
      await db.translationCache.upsert({
        where: { chiave_locale: { chiave: text, locale } },
        create: {
          id: crypto.randomUUID(),
          chiave: text,
          locale,
          testoOriginale: text,
          testoTradotto: translated,
          sezione: 'auto',
        },
        update: {
          testoTradotto: translated,
          updatedAt: new Date(),
        },
      });
    } catch {
      // Ignora errori di scrittura cache
    }
  }

  // 5. Salva in memoria
  memoryCache.set(cacheKey, translated);
  return translated;
}

/**
 * Traduce un oggetto (es. SiteInfo) traducendo tutti i campi stringa.
 */
export async function translateObject<T extends Record<string, unknown>>(
  obj: T,
  locale: Locale,
  fieldsToTranslate?: string[]
): Promise<T> {
  if (locale === 'it') return obj;

  const result = { ...obj };
  const fields = fieldsToTranslate || Object.keys(result).filter(k => typeof result[k] === 'string');

  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value.trim()) {
      result[field] = await translateText(value, locale) as unknown as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Traduce un array di oggetti (es. eventi, articoli).
 */
export async function translateArray<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fieldsToTranslate?: string[]
): Promise<T[]> {
  if (locale === 'it') return items;
  return Promise.all(items.map(item => translateObject(item, locale, fieldsToTranslate)));
}

/**
 * Reset della cache traduzioni (usato dall'admin).
 */
export async function clearTranslationCache(locale?: string): Promise<number> {
  const where = locale ? { locale } : {};
  const result = await db.translationCache.deleteMany({ where: { ...where, sezione: 'auto' } });
  memoryCache.clear();
  return result.count;
}

/**
 * Conta le traduzioni in cache.
 */
export async function getTranslationStats(): Promise<{ total: number; byLocale: Record<string, number> }> {
  const all = await db.translationCache.findMany({ select: { locale: true } });
  const byLocale: Record<string, number> = {};
  for (const item of all) {
    byLocale[item.locale] = (byLocale[item.locale] || 0) + 1;
  }
  return { total: all.length, byLocale: byLocale };
}

/**
 * Traduce un testo usando Google Translate (unofficial API) come primaria
 * e MyMemory come fallback.
 */
async function callTranslationAPI(text: string, locale: Locale): Promise<string> {
  const targetLang = LOCALE_TO_CODE[locale] || locale;
  const truncatedText = text.substring(0, 500);

  // Metodo 1: Google Translate (unofficial) — nessun limite giornaliero
  try {
    const translated = await callGoogleTranslate(truncatedText, targetLang);
    if (translated && translated !== truncatedText) {
      return translated;
    }
  } catch {
    // Passa al fallback
  }

  // Metodo 2: MyMemory API (gratuito, 5000 char/day senza API key)
  try {
    const translated = await callMyMemory(truncatedText, targetLang);
    if (translated && translated !== truncatedText) {
      return translated;
    }
  } catch {
    // Fallback finale
  }

  // Se tutto fallisce, restituisci il testo originale
  return text;
}

/**
 * Google Translate unofficial API — affidabile, senza limiti noti.
 */
async function callGoogleTranslate(text: string, targetLang: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;

  const data = await response.json();
  // La risposta è un array: [[["traduzione","originale",...],...], ...]
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  const translatedParts: string[] = [];
  for (const segment of data[0]) {
    if (Array.isArray(segment) && typeof segment[0] === 'string') {
      translatedParts.push(segment[0]);
    }
  }

  const result = translatedParts.join('');
  return result || null;
}

/**
 * MyMemory API — fallback secondario.
 */
async function callMyMemory(text: string, targetLang: string): Promise<string | null> {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|${targetLang}`,
    { signal: AbortSignal.timeout(5000) }
  );
  const data = await response.json();

  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    let translated = data.responseData.translatedText;
    // MyMemory restituisce MAIUSCOLO quando non trova la traduzione
    if (translated === translated.toUpperCase() && text !== text.toUpperCase()) {
      translated = translated.charAt(0).toUpperCase() + translated.slice(1).toLowerCase();
    }
    return translated;
  }
  return null;
}

/**
 * Traduce massa di testi (per il bottone "Traduci tutto" dell'admin).
 * Include un delay tra le chiamate per evitare rate limiting.
 */
export async function translateAllContent(locale: Locale): Promise<{ translated: number; errors: number }> {
  let translated = 0;
  let errors = 0;

  // Funzione helper che aggiunge un delay tra le traduzioni
  const translateWithDelay = async (text: string): Promise<boolean> => {
    try {
      const result = await translateText(text, locale);
      if (result !== text) {
        translated++;
        return true;
      } else {
        errors++;
        return false;
      }
    } catch {
      errors++;
      return false;
    }
  };

  // Traduce i contenuti di SiteInfo
  try {
    const siteInfo = await db.siteInfo.findFirst();
    if (siteInfo) {
      const fields = ['nomeLocale', 'slogan', 'chiSiamoTitolo', 'chiSiamoTesto', 'heroTitle', 'heroSubtitle', 'heroCTAText', 'specialitaTitle', 'specialitaSubtitle'];
      for (const field of fields) {
        const value = siteInfo[field as keyof typeof siteInfo];
        if (typeof value === 'string' && value.trim()) {
          await translateWithDelay(value);
          await delay(350);
        }
      }
    }
  } catch { errors++; }

  // Traduce categorie
  try {
    const categorie = await db.categoria.findMany();
    for (const cat of categorie) {
      await translateWithDelay(cat.nome);
      await delay(350);
    }
  } catch { errors++; }

  // Traduce articoli (nome + descrizione)
  try {
    const articoli = await db.articolo.findMany();
    for (const art of articoli) {
      await translateWithDelay(art.nome);
      await delay(350);
      if (art.descrizione) {
        await translateWithDelay(art.descrizione);
        await delay(350);
      }
    }
  } catch { errors++; }

  // Traduce eventi (tutti i campi testuali)
  try {
    const eventi = await db.evento.findMany();
    for (const ev of eventi) {
      await translateWithDelay(ev.titolo);
      await delay(350);
      if (ev.descrizioneBreve) {
        await translateWithDelay(ev.descrizioneBreve);
        await delay(350);
      }
      if (ev.descrizione && ev.descrizione !== ev.descrizioneBreve) {
        await translateWithDelay(ev.descrizione);
        await delay(350);
      }
      if (ev.location) {
        await translateWithDelay(ev.location);
        await delay(350);
      }
      if (ev.incluso) {
        await translateWithDelay(ev.incluso);
        await delay(350);
      }
      if (ev.infoAggiuntive) {
        await translateWithDelay(ev.infoAggiuntive);
        await delay(350);
      }
    }
  } catch { errors++; }

  // Traduce FooterInfo (orari, giorni chiusura, indirizzo, città)
  try {
    const footerInfo = await db.footerInfo.findFirst();
    if (footerInfo) {
      const footerFields = ['orariApertura', 'giorniChiusura', 'indirizzo', 'citta'];
      for (const field of footerFields) {
        const value = footerInfo[field as keyof typeof footerInfo];
        if (typeof value === 'string' && value.trim()) {
          await translateWithDelay(value);
          await delay(350);
        }
      }
    }
  } catch { errors++; }

  // Traduce allergeni
  try {
    const allergeni = await db.allergene.findMany();
    for (const alg of allergeni) {
      await translateWithDelay(alg.nome);
      await delay(350);
      if (alg.descrizione) {
        await translateWithDelay(alg.descrizione);
        await delay(350);
      }
    }
  } catch { errors++; }

  // Traduce CompanyData (testi cookie banner + policy custom)
  try {
    const companyData = await db.companyData.findFirst();
    if (companyData) {
      const cdFields = ['cookieBannerText', 'cookieAcceptText', 'cookieDeclineText', 'cookiesPolicy', 'privacyPolicy', 'terminiServizio'];
      for (const field of cdFields) {
        const value = companyData[field as keyof typeof companyData];
        if (typeof value === 'string' && value.trim()) {
          await translateWithDelay(value);
          await delay(350);
        }
      }
    }
  } catch { errors++; }

  return { translated, errors };
}

export { SUPPORTED_LOCALES };