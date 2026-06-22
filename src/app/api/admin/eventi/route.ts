import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const eventi = await db.evento.findMany({
    orderBy: { data: 'desc' },
    include: { prenotazioni: true },
  });
  return NextResponse.json(eventi);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const evento = await db.evento.create({
    data: {
      titolo: body.titolo,
      descrizione: body.descrizione,
      descrizioneBreve: body.descrizioneBreve || null,
      immagineUrl: body.immagineUrl || null,
      data: new Date(body.data),
      oraInizio: body.oraInizio,
      oraFine: body.oraFine,
      prezzo: parseFloat(body.prezzo) || 0,
      gratuito: body.gratuito || false,
      graditaPrenotazione: body.graditaPrenotazione || false,
      capacita: parseInt(body.capacita) || 0,
      postiDisponibili: parseInt(body.postiDisponibili) || 0,
      inEvidenza: body.inEvidenza || false,
      attivo: body.attivo !== undefined ? body.attivo : true,
    },
  });
  return NextResponse.json(evento, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const evento = await db.evento.update({
    where: { id },
    data: {
      ...data,
      data: data.data ? new Date(data.data) : undefined,
      prezzo: data.prezzo ? parseFloat(data.prezzo) : undefined,
      capacita: data.capacita ? parseInt(data.capacita) : undefined,
      postiDisponibili: data.postiDisponibili ? parseInt(data.postiDisponibili) : undefined,
    },
  });
  return NextResponse.json(evento);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
  await db.evento.delete({ where: { id } });
  return NextResponse.json({ success: true });
}