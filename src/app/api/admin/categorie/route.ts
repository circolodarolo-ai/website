import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categorie = await db.categoria.findMany({
      orderBy: { ordine: 'asc' },
      include: { _count: { select: { articoli: true } } },
    });
    return NextResponse.json(categorie);
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoria = await db.categoria.create({
      data: {
        nome: body.nome,
        icona: body.icona || null,
        ordine: body.ordine != null ? parseInt(body.ordine) : 0,
        attiva: body.attiva !== undefined ? body.attiva : true,
      },
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const categoria = await db.categoria.update({
      where: { id },
      data: {
        ...data,
        ordine: data.ordine != null ? parseInt(data.ordine) : undefined,
      },
    });
    return NextResponse.json(categoria);
  } catch {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.categoria.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}