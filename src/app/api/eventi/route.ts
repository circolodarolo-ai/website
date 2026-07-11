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

    // Include: all recurring events + all future non-recurring events
    const eventiVisibili = eventi.filter((e) => {
      if (e.ricorrente) return true;
      const dataEvento = new Date(e.data);
      return dataEvento >= oggi;
    });

    return NextResponse.json(eventiVisibili);
  } catch (error) {
    console.error('Errore nel recupero eventi:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli eventi' },
      { status: 500 }
    );
  }
}