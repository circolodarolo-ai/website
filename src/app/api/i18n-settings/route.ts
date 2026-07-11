import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET pubblico: restituisce solo le lingue attive (per il selettore nell'header)
export async function GET() {
  try {
    const settings = await db.i18nSettings.findUnique({ where: { id: 'default' } });
    if (!settings || !settings.multilinguaAttivo) {
      return NextResponse.json({ active: false, languages: [] });
    }

    const languages: { code: string; label: string; flag: string }[] = [{ code: 'it', label: 'Italiano', flag: '🇮🇹' }];

    if (settings.enAttivo) languages.push({ code: 'en', label: 'English', flag: '🇬🇧' });
    if (settings.frAttivo) languages.push({ code: 'fr', label: 'Français', flag: '🇫🇷' });
    if (settings.deAttivo) languages.push({ code: 'de', label: 'Deutsch', flag: '🇩🇪' });
    if (settings.esAttivo) languages.push({ code: 'es', label: 'Español', flag: '🇪🇸' });

    return NextResponse.json({ active: true, languages });
  } catch {
    return NextResponse.json({ active: false, languages: [] });
  }
}