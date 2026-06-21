import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sezione = searchParams.get('sezione');

    const where = sezione ? { sezione } : {};
    const images = await db.siteImage.findMany({
      where,
      orderBy: [{ ordine: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Images GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const image = await db.siteImage.create({
      data: {
        sezione: body.sezione,
        titolo: body.titolo || null,
        descrizione: body.descrizione || null,
        url: body.url,
        ordine: body.ordine ?? 0,
        attiva: body.attiva !== undefined ? body.attiva : true,
      },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Images POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const image = await db.siteImage.update({
      where: { id },
      data,
    });
    return NextResponse.json(image);
  } catch (error) {
    console.error('Images PUT error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });

    await db.siteImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Images DELETE error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
