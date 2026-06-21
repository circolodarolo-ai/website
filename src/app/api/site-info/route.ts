import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let info = await db.siteInfo.findFirst();
    if (!info) {
      info = await db.siteInfo.create({
        data: { id: 'default' },
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero delle informazioni' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const info = await db.siteInfo.upsert({
      where: { id: body.id || 'default' },
      update: body,
      create: { id: 'default', ...body },
    });
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento' },
      { status: 500 }
    );
  }
}