import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const eventi = await db.evento.findMany({
      orderBy: { data: 'desc' },
      include: { Reservation: true },
    });
    // Remap for frontend compatibility
    const mapped = eventi.map(e => ({ ...e, prenotazioni: e.Reservation }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Eventi GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const evento = await db.evento.create({
      data: {
        id: crypto.randomUUID(),
        titolo: body.titolo,
        slug,
        descrizione: body.descrizione || '',
        descrizioneBreve: body.descrizioneBreve || null,
        immagineUrl: body.immagineUrl || null,
        data: body.ricorrente ? (body.data ? new Date(body.data) : new Date()) : new Date(body.data),
        oraInizio: body.oraInizio,
        oraFine: body.oraFine,
        prezzo: parseFloat(body.prezzo) || 0,
        gratuito: body.gratuito || false,
        graditaPrenotazione: body.graditaPrenotazione || false,
        capacita: parseInt(body.capacita) || 0,
        postiDisponibili: parseInt(body.postiDisponibili) || 0,
        attivo: body.attivo !== undefined ? body.attivo : true,
        ricorrente: body.ricorrente || false,
        giorniRicorrenza: body.giorniRicorrenza || null,
        inEvidenza: body.inEvidenza || false,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(evento, { status: 201 });
  } catch (error) {
    console.error('Eventi POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const evento = await db.evento.update({
      where: { id },
      data: {
        ...data,
        data: data.data ? new Date(data.data) : undefined,
        prezzo: data.prezzo !== undefined ? parseFloat(data.prezzo) : undefined,
        capacita: data.capacita !== undefined ? parseInt(data.capacita) : undefined,
        postiDisponibili: data.postiDisponibili !== undefined ? parseInt(data.postiDisponibili) : undefined,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(evento);
  } catch (error) {
    console.error('Eventi PUT error:', error);
    return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.evento.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Eventi DELETE error:', error);
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }
}