import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET — elenca tutti gli utenti con permessi
export async function GET() {
  try {
    const utenti = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { Permission: true },
      select: {
        id: true, email: true, nome: true, cognome: true, ruolo: true, createdAt: true, updatedAt: true,
        Permission: true,
      },
    });
    return NextResponse.json(utenti);
  } catch {
    return NextResponse.json({ error: 'Errore nel caricamento utenti' }, { status: 500 });
  }
}

// POST — crea nuovo utente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nome, cognome, password, ruolo, permessi } = body;

    if (!email || !nome || !password) {
      return NextResponse.json({ error: 'Email, nome e password sono obbligatori' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email gi\u00E0 utilizzata' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        nome,
        cognome: cognome || null,
        password: hashed,
        ruolo: ruolo || 'admin',
        updatedAt: new Date(),
        Permission: permessi ? {
          create: {
            id: crypto.randomUUID(),
            puoGestireMenu: permessi.puoGestireMenu ?? true,
            puoGestireFooter: permessi.puoGestireFooter ?? true,
            puoGestireTemi: permessi.puoGestireTemi ?? true,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? true,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? true,
            puoGestireProfili: permessi.puoGestireProfili ?? false,
            puoGestireAnalytics: permessi.puoGestireAnalytics ?? true,
            puoGestireSito: permessi.puoGestireSito ?? true,
            puoGestireEventi: permessi.puoGestireEventi ?? true,
            updatedAt: new Date(),
          },
        } : undefined,
      },
      include: { Permission: true },
    });

    // Return user without password
    const { password: _, ...userSafe } = user;
    return NextResponse.json(userSafe, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Errore nella creazione utente' }, { status: 500 });
  }
}

// PUT — aggiorna utente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, nome, cognome, password, ruolo, permessi } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    // Check email uniqueness if changed
    if (email && email !== existing.email) {
      const emailTaken = await db.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email gi\u00E0 utilizzata' }, { status: 409 });
      }
    }

    const data: Record<string, unknown> = { updatedAt: new Date() };
    if (email !== undefined) data.email = email;
    if (nome !== undefined) data.nome = nome;
    if (cognome !== undefined) data.cognome = cognome;
    if (ruolo !== undefined) data.ruolo = ruolo;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await db.user.update({
      where: { id },
      data,
      include: { Permission: true },
    });

    // Update permissions if provided
    if (permessi && user.Permission) {
      await db.permission.update({
        where: { userId: id },
        data: {
          puoGestireMenu: permessi.puoGestireMenu ?? user.Permission.puoGestireMenu,
          puoGestireFooter: permessi.puoGestireFooter ?? user.Permission.puoGestireFooter,
          puoGestireTemi: permessi.puoGestireTemi ?? user.Permission.puoGestireTemi,
          puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? user.Permission.puoGestirePrenotazioni,
          puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? user.Permission.puoGestireDatiAzienda,
          puoGestireProfili: permessi.puoGestireProfili ?? user.Permission.puoGestireProfili,
          puoGestireAnalytics: permessi.puoGestireAnalytics ?? user.Permission.puoGestireAnalytics,
          puoGestireSito: permessi.puoGestireSito ?? user.Permission.puoGestireSito,
          puoGestireEventi: permessi.puoGestireEventi ?? user.Permission.puoGestireEventi,
        },
      });
    } else if (permessi && !user.Permission) {
      await db.permission.create({
        data: {
          id: crypto.randomUUID(),
          userId: id,
          puoGestireMenu: permessi.puoGestireMenu ?? true,
          puoGestireFooter: permessi.puoGestireFooter ?? true,
          puoGestireTemi: permessi.puoGestireTemi ?? true,
          puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? true,
          puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? true,
          puoGestireProfili: permessi.puoGestireProfili ?? false,
          puoGestireAnalytics: permessi.puoGestireAnalytics ?? true,
          puoGestireSito: permessi.puoGestireSito ?? true,
          puoGestireEventi: permessi.puoGestireEventi ?? true,
          updatedAt: new Date(),
        },
      });
    }

    const updated = await db.user.findUnique({ where: { id }, include: { Permission: true } });
    const { password: _, ...userSafe } = updated!;
    return NextResponse.json(userSafe);
  } catch {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento utente' }, { status: 500 });
  }
}

// DELETE — elimina utente
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID obbligatorio' }, { status: 400 });
    }

    // Check if it's the last admin
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const adminCount = await db.user.count({ where: { ruolo: 'admin' } });
    if (user.ruolo === 'admin' && adminCount <= 1) {
      return NextResponse.json({ error: 'Non puoi eliminare l\'ultimo admin' }, { status: 400 });
    }

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}