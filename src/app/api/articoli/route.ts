import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const articoli = await db.articolo.findMany({
      where: {
        attivo: true,
        OR: [
          { eBestChoice: true },
          { prezzoPromozionale: { not: null } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        Categoria: true,
        AllergeneArticolo: { include: { Allergene: true } },
      },
    });
    return NextResponse.json(articoli);
  } catch (error) {
    console.error('Errore nel recupero articoli in evidenza:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli articoli' },
      { status: 500 }
    );
  }
}