import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const prenotazioni = await db.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { evento: true },
  });
  return NextResponse.json(prenotazioni);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...data } = body;
  const prenotazione = await db.reservation.update({
    where: { id },
    data,
  });
  return NextResponse.json(prenotazione);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
  await db.reservation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}