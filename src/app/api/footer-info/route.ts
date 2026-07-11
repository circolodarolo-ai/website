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
    console.error('FooterInfo GET error:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del footer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // Strip reserved fields that cannot be updated
    const { id, createdAt, updatedAt, ...data } = body;
    const info = await db.footerInfo.upsert({
      where: { id: id || 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    return NextResponse.json(info);
  } catch (error) {
    console.error('FooterInfo PUT error:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento' },
      { status: 500 }
    );
  }
}