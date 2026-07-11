import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyToken(token);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: { Permission: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch {
    return NextResponse.json({ error: 'Token non valido o scaduto' }, { status: 401 });
  }
}