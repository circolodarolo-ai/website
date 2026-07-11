import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagina = searchParams.get('pagina');
    const posizione = searchParams.get('posizione');

    // Costruisci la clausola WHERE con tipizzazione corretta per Prisma
    const conditions: Prisma.BannerPubblicitarioWhereInput[] = [
      { attivo: true },
    ];

    if (posizione) {
      conditions.push({ posizione });
    }

    if (pagina) {
      conditions.push({
        OR: [
          { pagine: { contains: pagina } },
          { pagine: null },
          { pagine: '' },
        ],
      });
    }

    const where: Prisma.BannerPubblicitarioWhereInput = { AND: conditions };

    console.log('[Banners public GET]', { pagina, posizione, where: JSON.stringify(where) });

    const banners = await db.bannerPubblicitario.findMany({
      where,
      orderBy: [{ ordine: 'asc' }, { createdAt: 'desc' }],
    });

    console.log('[Banners public GET] Found', banners.length, 'banners');
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Banners public GET error:', error);
    return NextResponse.json([], { status: 200 });
  }
}