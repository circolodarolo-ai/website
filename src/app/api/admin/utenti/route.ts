import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET — elenca tutti gli utenti con permessi
export async function GET() {
  try {
    const utenti = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { permessi: true },
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email gi\u00E0 utilizzata' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        nome,
        cognome: cognome || null,
        password: hashed,
        ruolo: ruolo || 'admin',
        permessi: permessi ? {
          create: {
            puoGestireMenu: permessi.puoGestireMenu ?? true,
            puoGestireFooter: permessi.puoGestireFooter ?? true,
            puoGestireTemi: permessi.puoGestireTemi ?? true,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? true,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? true,
            puoGestireProfili: permessi.puoGestireProfili ?? false,
            puoGestireAnalytics: permessi.puoGestireAnalytics ?? true,
            puoGestireSito: permessi.puoGestireSito ?? true,
            puoGestireEventi: permessi.puoGestireEventi ?? true,
          },
        } : undefined,
      },
      include: { permessi: true },
    });

    // Return user without password
    const { password: _, ...userSafe } = user;
    return NextResponse.json(userSafe, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Errore';
    return NextResponse.json({ error: msg }, { status: 500 });
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

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    // Check email uniqueness if changed
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email gi\u00E0 utilizzata' }, { status: 409 });
      }
    }

    const data: Record<string, unknown> = {};
    if (email !== undefined) data.email = email;
    if (nome !== undefined) data.nome = nome;
    if (cognome !== undefined) data.cognome = cognome;
    if (ruolo !== undefined) data.ruolo = ruolo;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { permessi: true },
    });

    // Update permissions if provided
    if (permessi && user.permessi) {
      await prisma.permission.update({
        where: { userId: id },
        data: {
          puoGestireMenu: permessi.puoGestireMenu ?? user.permessi.puoGestireMenu,
          puoGestireFooter: permessi.puoGestireFooter ?? user.permessi.puoGestireFooter,
          puoGestireTemi: permessi.puoGestireTemi ?? user.permessi.puoGestireTemi,
          puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? user.permessi.puoGestirePrenotazioni,
          puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? user.permessi.puoGestireDatiAzienda,
          puoGestireProfili: permessi.puoGestireProfili ?? user.permessi.puoGestireProfili,
          puoGestireAnalytics: permessi.puoGestireAnalytics ?? user.permessi.puoGestireAnalytics,
          puoGestireSito: permessi.puoGestireSito ?? user.permessi.puoGestireSito,
          puoGestireEventi: permessi.puoGestireEventi ?? user.permessi.puoGestireEventi,
        },
      });
    } else if (permessi && !user.permessi) {
      await prisma.permission.create({
        data: {
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
        },
      });
    }

    const updated = await prisma.user.findUnique({ where: { id }, include: { permessi: true } });
    const { password: _, ...userSafe } = updated!;
    return NextResponse.json(userSafe);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Errore';
    return NextResponse.json({ error: msg }, { status: 500 });
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
    }

    const adminCount = await prisma.user.count({ where: { ruolo: 'admin' } });
    if (user.ruolo === 'admin' && adminCount <= 1) {
      return NextResponse.json({ error: 'Non puoi eliminare l\'ultimo admin' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}