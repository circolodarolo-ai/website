import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const allergeni = await db.allergene.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { articoli: true } } },
    });
    return NextResponse.json(allergeni);
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const allergene = await db.allergene.create({
      data: {
        nome: body.nome,
        icona: body.icona || null,
      },
    });
    return NextResponse.json(allergene, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const allergene = await db.allergene.update({
      where: { id },
      data,
    });
    return NextResponse.json(allergene);
  } catch {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.allergene.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}