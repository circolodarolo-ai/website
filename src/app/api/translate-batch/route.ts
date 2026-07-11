import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/translate-batch
 * Riceve un array di testi e restituisce le traduzioni dalla cache DB.
 * NON chiama API di traduzione — serve solo a leggere dalla cache popolata dall'admin ("Traduci tutto").
 *
 * Body: { locale: string, texts: { key: string, text: string }[] }
 * Response: { translations: Record<string, string> }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale, texts } = body as {
      locale: string;
      texts: { key: string; text: string }[];
    };

    if (!locale || locale === 'it' || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    // Raccogli tutti i testi unici da cercare nella cache
    const uniqueTexts = [...new Set(texts.map(t => t.text).filter(Boolean))];

    // Query batch: cerca tutte le traduzioni per questa lingua e questi testi
    const cached = await db.translationCache.findMany({
      where: {
        locale,
        testoOriginale: { in: uniqueTexts },
      },
      select: {
        testoOriginale: true,
        testoTradotto: true,
      },
    });

    // Mappa testoOriginale → testoTradotto
    const cacheMap = new Map<string, string>();
    for (const item of cached) {
      cacheMap.set(item.testoOriginale, item.testoTradotto);
    }

    // Costruisci la risposta mappando key → testo tradotto (o originale se non in cache)
    const translations: Record<string, string> = {};
    for (const item of texts) {
      translations[item.key] = cacheMap.get(item.text) || item.text;
    }

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: {} });
  }
}