import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categorie = await db.categoria.findMany({
      orderBy: { ordine: 'asc' },
      include: { _count: { select: { Articolo: true } } },
    });
    // Remap _count.Articolo → _count.articoli for frontend compatibility
    const mapped = categorie.map(c => ({
      ...c,
      _count: { articoli: c._count.Articolo },
    }));
    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoria = await db.categoria.create({
      data: {
        id: crypto.randomUUID(),
        nome: body.nome,
        icona: body.icona && body.icona.trim() !== '' ? body.icona : null,
        ordine: body.ordine != null ? parseInt(body.ordine) : 0,
        attiva: body.attiva !== undefined ? body.attiva : true,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(categoria, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/categorie]', err);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, _count, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    }
    // Sanitize: convert empty strings to null for nullable fields
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.icona !== undefined) updateData.icona = data.icona && data.icona.trim() !== '' ? data.icona : null;
    if (data.ordine !== undefined) updateData.ordine = data.ordine != null ? parseInt(data.ordine) : 0;
    if (data.attiva !== undefined) updateData.attiva = data.attiva;

    const categoria = await db.categoria.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(categoria);
  } catch (err) {
    console.error('[PUT /api/admin/categorie]', err);
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