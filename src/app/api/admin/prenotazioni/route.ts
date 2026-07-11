import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const prenotazioni = await db.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { Evento: true },
    });
    const mapped = prenotazioni.map(p => {
      const { Evento, ...rest } = p;
      return { ...rest, evento: Evento, tipologia: (rest as Record<string, unknown>).tipologia || 'ristorante' };
    });
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Prenotazioni GET error:', error);
    // Fallback: prova senza include Evento
    try {
      const prenotazioni = await db.reservation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      const safe = prenotazioni.map(p => ({
        ...p,
        evento: null,
        tipologia: (p as Record<string, unknown>).tipologia || 'ristorante',
      }));
      return NextResponse.json(safe);
    } catch (fallbackError) {
      console.error('Prenotazioni GET fallback error:', fallbackError);
      return NextResponse.json([], { status: 200 });
    }
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const prenotazione = await db.reservation.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
    return NextResponse.json(prenotazione);
  } catch (error) {
    console.error('Prenotazioni PUT error:', error);
    return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Prenotazioni DELETE error:', error);
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }
}