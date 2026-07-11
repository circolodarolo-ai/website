import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome || !body.cognome || !body.email || !body.telefono || !body.data || !body.ora || !body.persone) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date();

    const baseData = {
      id,
      nome: body.nome,
      cognome: body.cognome,
      email: body.email,
      telefono: body.telefono,
      data: body.data,
      ora: body.ora,
      persone: parseInt(body.persone),
      note: body.note || null,
      stato: 'pending' as const,
      eventoId: body.eventoId || null,
      createdAt: now,
      updatedAt: now,
    };

    // Primo tentativo: con tipologia
    let prenotazione;
    try {
      prenotazione = await db.reservation.create({
        data: { ...baseData, tipologia: body.tipologia || 'ristorante' },
      });
    } catch (firstErr) {
      // Secondo tentativo: senza tipologia (colonna potrebbe non esistere)
      console.warn('Tentativo con tipologia fallito, riprovo senza:', firstErr);
      try {
        prenotazione = await db.reservation.create({
          data: baseData,
        });
      } catch {
        return NextResponse.json(
          { error: 'Errore nella creazione della prenotazione' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(prenotazione, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Errore nella prenotazione' },
      { status: 500 }
    );
  }
}

// GET rimosso — le prenotazioni sono accessibili solo via /api/admin/prenotazioni (protetto da auth)