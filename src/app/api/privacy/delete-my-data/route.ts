import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/privacy/delete-my-data
// L'utente richiede la cancellazione dei propri dati analytics tramite sessionId.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId mancante' }, { status: 400 });
    }

    // Trova tutti gli eventi di questa sessione prima di cancellarli
    const events = await db.analyticsEvent.findMany({
      where: { sessionId },
      select: { id: true, timestamp: true },
    });

    if (events.length === 0) {
      return NextResponse.json({ message: 'Nessun dato trovato per questa sessione.', deleted: 0 });
    }

    // Raggruppa per data per aggiornare i daily counts
    const eventsByDate: Record<string, number> = {};
    events.forEach(e => {
      const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
      eventsByDate[dateStr] = (eventsByDate[dateStr] || 0) + 1;
    });

    // Cancella tutti gli eventi della sessione
    const result = await db.analyticsEvent.deleteMany({
      where: { sessionId },
    });

    // Aggiorna i daily counts sottraendo le visite cancellate
    for (const [dateStr, count] of Object.entries(eventsByDate)) {
      const dayStart = new Date(dateStr + 'T00:00:00.000Z');
      const dayEnd = new Date(dateStr + 'T23:59:59.999Z');
      const dailyRecord = await db.analyticsDaily.findFirst({
        where: { date: { gte: dayStart, lt: new Date(dayEnd.getTime() + 86400000) } },
      });
      if (dailyRecord) {
        await db.analyticsDaily.update({
          where: { id: dailyRecord.id },
          data: {
            totalVisits: Math.max(0, dailyRecord.totalVisits - count),
            uniqueVisitors: Math.max(0, dailyRecord.uniqueVisitors - 1),
          },
        });
      }
    }

    return NextResponse.json({
      message: 'Dati cancellati con successo.',
      deleted: result.count,
    });
  } catch (error) {
    console.error('Privacy delete error:', error);
    return NextResponse.json({ error: 'Errore nella cancellazione' }, { status: 500 });
  }
}