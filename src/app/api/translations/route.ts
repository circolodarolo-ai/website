import { NextRequest, NextResponse } from 'next/server';

// Import statici — garantiti nel bundle di Next.js in ogni ambiente
import en from '@/messages/en.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';
import es from '@/messages/es.json';

const translations: Record<string, Record<string, Record<string, string>>> = {
  en, fr, de, es,
};

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale');
  if (!locale || locale === 'it') {
    return NextResponse.json({});
  }

  const messages = translations[locale];
  if (messages) {
    return NextResponse.json(messages);
  }

  return NextResponse.json({});
}