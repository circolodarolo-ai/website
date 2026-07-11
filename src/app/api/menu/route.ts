import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categorie = await db.categoria.findMany({
      where: { attiva: true },
      orderBy: { ordine: 'asc' },
      include: {
        Articolo: {
          where: { attivo: true },
          orderBy: { createdAt: 'asc' },
          include: {
            AllergeneArticolo: {
              include: { Allergene: true },
            },
          },
        },
      },
    });

    // Remap to match frontend interface expectations
    const mapped = categorie.map(c => ({
      ...c,
      articoli: c.Articolo.map(a => ({
        ...a,
        allergeni: a.AllergeneArticolo.map(aa => ({
          id: aa.id,
          allergene: aa.Allergene,
        })),
      })),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Errore nel recupero del menu:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del menu' },
      { status: 500 }
    );
  }
}