import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome || !body.cognome || !body.email || !body.telefono || !body.data || !body.ora || !body.persone) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori' },
        { status: 400 }
      );
    }

    const prenotazione = await db.prenotazione.create({
      data: {
        nome: body.nome,
        cognome: body.cognome,
        email: body.email,
        telefono: body.telefono,
        data: body.data,
        ora: body.ora,
        persone: parseInt(body.persone),
        note: body.note || null,
        stato: 'pending',
        eventoId: body.eventoId || null,
      },
    });

    return NextResponse.json(prenotazione, { status: 201 });
  } catch (error) {
    console.error('Errore nella prenotazione:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const prenotazioni = await db.prenotazione.findMany({
      orderBy: { createdAt: 'desc' },
      include: { evento: true },
    });
    return NextResponse.json(prenotazioni);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero delle prenotazioni' },
      { status: 500 }
    );
  }
}