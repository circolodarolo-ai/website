import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token mancante' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

    // Token expiry check (24 hours)
    if (Date.now() - decoded.ts > 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Token scaduto' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: { permessi: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Me GET error:', error);
    return NextResponse.json({ error: 'Token non valido' }, { status: 401 });
  }
}
