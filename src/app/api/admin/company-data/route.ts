import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let data = await db.companyData.findFirst();
    if (!data) {
      data = await db.companyData.create({ data: {} });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('CompanyData GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await db.companyData.findFirst();

    if (existing) {
      const { id, createdAt, updatedAt, ...data } = body;
      const updated = await db.companyData.update({
        where: { id: existing.id },
        data,
      });
      return NextResponse.json(updated);
    } else {
      const { id, createdAt, updatedAt, ...data } = body;
      const created = await db.companyData.create({ data });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('CompanyData PUT error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}
