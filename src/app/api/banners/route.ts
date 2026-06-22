import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');
    const posizione = searchParams.get('posizione');

    const where: Record<string, unknown> = { attivo: true };
    if (pagina) where.pagina = pagina;
    if (posizione) where.posizione = posizione;

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