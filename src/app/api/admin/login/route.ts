import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { permessi: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
    }

    // Create a simple base64 token (email:ruolo:timestamp)
    const tokenData = JSON.stringify({ userId: user.id, email: user.email, ruolo: user.ruolo, ts: Date.now() });
    const token = Buffer.from(tokenData).toString('base64');

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Errore nel login', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
