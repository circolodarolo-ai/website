import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { translateAllContent, clearTranslationCache, getTranslationStats, SUPPORTED_LOCALES } from '@/lib/translate';
import type { Locale } from '@/lib/translate';

// GET: recupera impostazioni i18n + statistiche traduzioni
export async function GET() {
  try {
    let settings = await db.i18nSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await db.i18nSettings.create({
        data: { id: 'default', updatedAt: new Date() },
      });
    }

    let stats = { total: 0, byLocale: {} as Record<string, number> };
    try {
      stats = await getTranslationStats();
    } catch {
      // Tabella non ancora creata
    }

    return NextResponse.json({ settings, stats });
  } catch (error) {
    console.error('[API i18n GET]', error);
    return NextResponse.json({ error: 'Errore nel caricamento delle impostazioni' }, { status: 500 });
  }
}

// PUT: aggiorna impostazioni i18n
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { multilinguaAttivo, enAttivo, frAttivo, deAttivo, esAttivo } = body;

    const settings = await db.i18nSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        multilinguaAttivo: multilinguaAttivo ?? false,
        enAttivo: enAttivo ?? false,
        frAttivo: frAttivo ?? false,
        deAttivo: deAttivo ?? false,
        esAttivo: esAttivo ?? false,
        updatedAt: new Date(),
      },
      update: {
        multilinguaAttivo: multilinguaAttivo ?? false,
        enAttivo: enAttivo ?? false,
        frAttivo: frAttivo ?? false,
        deAttivo: deAttivo ?? false,
        esAttivo: esAttivo ?? false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[API i18n PUT]', error);
    return NextResponse.json({ error: 'Errore nel salvataggio' }, { status: 500 });
  }
}

// POST: azioni speciali (traduci tutto, reset cache)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, locale } = body;

    if (action === 'translate-all') {
      if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
        return NextResponse.json({ error: 'Lingua non valida' }, { status: 400 });
      }
      const result = await translateAllContent(locale as Locale);
      return NextResponse.json({ result });
    }

    if (action === 'clear-cache') {
      const count = await clearTranslationCache(locale);
      return NextResponse.json({ deleted: count });
    }

    return NextResponse.json({ error: 'Azione non valida' }, { status: 400 });
  } catch (error) {
    console.error('[API i18n POST]', error);
    return NextResponse.json({ error: 'Errore durante l\'azione' }, { status: 500 });
  }
}