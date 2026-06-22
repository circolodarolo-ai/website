import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');
    const posizione = searchParams.get('posizione');

    const where: Record<string, unknown> = { attivo: true };
    if (posizione) where.posizione = posizione;
    // The DB stores pages as a comma-separated string in 'pagine' field.
    // We use 'contains' to match if the requested page is in the list.
    // Also return banners with no page restriction (pagine is null/empty).
    if (pagina) {
      where.OR = [
        { pagine: { contains: pagina } },
        { pagine: null },
        { pagine: '' },
      ];
    }

    const banners = await db.bannerPubblicitario.findMany({
      where,
      orderBy: [{ ordine: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners public GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}