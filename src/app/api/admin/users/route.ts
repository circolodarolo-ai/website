import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { permessi: true },
    });
    // Remove passwords from response
    const safeUsers = users.map(({ password: _, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.password || !body.nome) {
      return NextResponse.json({ error: 'Nome, email e password obbligatori' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email già in uso' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await db.user.create({
      data: {
        email: body.email,
        nome: body.nome,
        cognome: body.cognome || null,
        password: passwordHash,
        ruolo: body.ruolo || 'admin',
        permessi: body.permessi ? {
          create: body.permessi,
        } : undefined,
      },
      include: { permessi: true },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, permessi, password, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...data };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update permissions if provided
    if (permessi) {
      const existingPerm = await db.permission.findUnique({ where: { userId: id } });
      if (existingPerm) {
        await db.permission.update({ where: { userId: id }, data: permessi });
      } else {
        await db.permission.create({ data: { userId: id, ...permessi } });
      }
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: { permessi: true },
    });

    const { password: _, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });

    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}
