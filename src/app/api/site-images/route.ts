import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint to read site images by section (no auth needed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sezione = searchParams.get('sezione');

    const where: Record<string, unknown> = { attiva: true };
    if (sezione) where.sezione = sezione;

    const images = await db.siteImage.findMany({
      where,
      orderBy: [{ ordine: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, sezione: true, titolo: true, descrizione: true, url: true, ordine: true },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('SiteImages public GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}