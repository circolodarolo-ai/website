import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const articoli = await db.articolo.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      categoria: true,
      allergeni: { include: { allergene: true } },
    },
  });
  return NextResponse.json(articoli);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const articolo = await db.articolo.create({
    data: {
      nome: body.nome,
      descrizione: body.descrizione || null,
      categoriaId: body.categoriaId,
      prezzo: parseFloat(body.prezzo),
      prezzoPromozionale: body.prezzoPromozionale ? parseFloat(body.prezzoPromozionale) : null,
      eBestChoice: body.eBestChoice || false,
      attivo: body.attivo !== undefined ? body.attivo : true,
      immagineUrl: body.immagineUrl || null,
    },
  });
  return NextResponse.json(articolo, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const articolo = await db.articolo.update({
    where: { id },
    data: {
      ...data,
      prezzo: data.prezzo ? parseFloat(data.prezzo) : undefined,
      prezzoPromozionale: data.prezzoPromozionale ? parseFloat(data.prezzoPromozionale) : null,
    },
  });
  return NextResponse.json(articolo);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
  await db.articolo.delete({ where: { id } });
  return NextResponse.json({ success: true });
}