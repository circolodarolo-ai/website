import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let info = await db.footerInfo.findFirst();
    if (!info) {
      info = await db.footerInfo.create({
        data: { id: 'default' },
      });
    }
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero del footer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const info = await db.footerInfo.upsert({
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