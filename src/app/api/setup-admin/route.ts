import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashSync } from 'bcryptjs';

export async function GET() {
  try {
    const existing = await db.user.findFirst({ where: { email: 'admin@circolodarolo.it' } });
    if (existing) return NextResponse.json({ message: 'Admin already exists' });

    const user = await db.user.create({
      data: {
        email: 'admin@circolodarolo.it',
        nome: 'Admin',
        cognome: 'Circolo',
        password: hashSync('admin', 10),
        ruolo: 'superadmin',
        Permission: { create: {
          puoGestireMenu: true, puoGestireFooter: true, puoGestireTemi: true,
          puoGestirePrenotazioni: true, puoGestireDatiAzienda: true, puoGestireProfili: true,
          puoGestireAnalytics: true, puoGestireSito: true, puoGestireEventi: true,
          puoGestireCookiePrivacy: true, puoGestireBanners: true, puoGestireMultilingua: true,
        }},
      },
      include: { Permission: true },
    });

    return NextResponse.json({ message: 'Admin created', email: user.email });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}