import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const posizione = searchParams.get('posizione');
    const attivo = searchParams.get('attivo');

    const where: Record<string, unknown> = {};
    if (posizione) where.posizione = posizione;
    if (attivo !== null) where.attivo = attivo === 'true';

    const banners = await db.bannerPubblicitario.findMany({
      where,
      orderBy: [{ ordine: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Admin Banners GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const banner = await db.bannerPubblicitario.create({
      data: {
        tipo: body.tipo || 'adsense',
        posizione: body.posizione || 'top',
        sponsorNome: body.sponsorNome || '',
        sponsorLogo: body.sponsorLogo || null,
        sponsorUrl: body.sponsorUrl || '',
        titolo: body.titolo || null,
        descrizione: body.descrizione || null,
        ctaTesto: body.ctaTesto || null,
        ctaUrl: body.ctaUrl || null,
        immagineUrl: body.immagineUrl || null,
        coloreSfondo: body.coloreSfondo || null,
        attivo: body.attivo !== undefined ? body.attivo : true,
        ordine: body.ordine ?? 0,
        pagine: body.pagine || null,
      },
    });
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Admin Banners POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, createdAt, updatedAt, ...data } = body;
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    const banner = await db.bannerPubblicitario.update({ where: { id }, data });
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Admin Banners PUT error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.bannerPubblicitario.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Banners DELETE error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}