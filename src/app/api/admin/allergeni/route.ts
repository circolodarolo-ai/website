import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const allergeni = await db.allergene.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { AllergeneArticolo: true } } },
    });
    // Remap for frontend compatibility
    const mapped = allergeni.map(a => ({
      ...a,
      _count: { articoli: a._count.AllergeneArticolo },
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Allergeni GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const allergene = await db.allergene.create({
      data: {
        id: crypto.randomUUID(),
        nome: body.nome,
        icona: body.icona || null,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(allergene, { status: 201 });
  } catch (error) {
    console.error('Allergeni POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const allergene = await db.allergene.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
    return NextResponse.json(allergene);
  } catch (error) {
    console.error('Allergeni PUT error:', error);
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
  } catch (error) {
    console.error('Allergeni DELETE error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}