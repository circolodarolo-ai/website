import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    const eventi = await db.evento.findMany({
      where: { attivo: true },
      orderBy: [
        { inEvidenza: 'desc' },
        { data: 'asc' },
      ],
    });

    const eventiFuturi = eventi.filter((e) => {
      const dataEvento = new Date(e.data);
      return dataEvento >= oggi;
    });

    return NextResponse.json(eventiFuturi);
  } catch (error) {
    console.error('Errore nel recupero eventi:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli eventi' },
      { status: 500 }
    );
  }
}