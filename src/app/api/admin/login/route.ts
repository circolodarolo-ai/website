import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { Permission: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    // Crea JWT firmato
    const token = await createToken({ id: user.id, email: user.email, ruolo: user.ruolo });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword });
  } catch {
    console.error('Login error');
    return NextResponse.json({ error: 'Errore nel login' }, { status: 500 });
  }
}