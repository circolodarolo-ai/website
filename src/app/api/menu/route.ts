import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categorie = await db.categoria.findMany({
      where: { attiva: true },
      orderBy: { ordine: 'asc' },
      include: {
        articoli: {
          where: { attivo: true },
          orderBy: { createdAt: 'asc' },
          include: {
            allergeni: {
              include: { allergene: true },
            },
          },
        },
      },
    });

    return NextResponse.json(categorie);
  } catch (error) {
    console.error('Errore nel recupero del menu:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del menu' },
      { status: 500 }
    );
  }
}