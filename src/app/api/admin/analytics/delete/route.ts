import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/admin/analytics/delete?startDate=...&endDate=...
// Cancella tutti gli eventi analytics in un range di date.
// Aggiorna anche i daily counts.
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json({ error: 'startDate e endDate richiesti (formato YYYY-MM-DD)' }, { status: 400 });
    }

    const startDate = new Date(startDateStr + 'T00:00:00.000Z');
    const endDate = new Date(endDateStr + 'T23:59:59.999Z');

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Date non valide' }, { status: 400 });
    }

    // Conta gli eventi da cancellare
    const count = await db.analyticsEvent.count({
      where: { timestamp: { gte: startDate, lte: endDate } },
    });

    // Raggruppa per data per aggiornare i daily
    const events = await db.analyticsEvent.findMany({
      where: { timestamp: { gte: startDate, lte: endDate } },
      select: { timestamp: true, sessionId: true },
    });

    const eventsByDate: Record<string, { count: number; uniqueSessions: Set<string> }> = {};
    events.forEach(e => {
      const dateStr = new Date(e.timestamp).toISOString().split('T')[0];
      if (!eventsByDate[dateStr]) eventsByDate[dateStr] = { count: 0, uniqueSessions: new Set() };
      eventsByDate[dateStr].count++;
      eventsByDate[dateStr].uniqueSessions.add(e.sessionId);
    });

    // Cancella gli eventi
    await db.analyticsEvent.deleteMany({
      where: { timestamp: { gte: startDate, lte: endDate } },
    });

    // Aggiorna i daily counts
    for (const [dateStr, info] of Object.entries(eventsByDate)) {
      const dayStart = new Date(dateStr + 'T00:00:00.000Z');
      const dayEnd = new Date(dateStr + 'T23:59:59.999Z');
      const dailyRecord = await db.analyticsDaily.findFirst({
        where: { date: { gte: dayStart, lt: new Date(dayEnd.getTime() + 86400000) } },
      });
      if (dailyRecord) {
        await db.analyticsDaily.update({
          where: { id: dailyRecord.id },
          data: {
            totalVisits: Math.max(0, dailyRecord.totalVisits - info.count),
            uniqueVisitors: Math.max(0, dailyRecord.uniqueVisitors - info.uniqueSessions.size),
          },
        });
      }
    }

    return NextResponse.json({
      message: `${count} eventi cancellati dal ${startDateStr} al ${endDateStr}`,
      deleted: count,
      datesAffected: Object.keys(eventsByDate),
    });
  } catch (error) {
    console.error('Admin analytics delete error:', error);
    return NextResponse.json({ error: 'Errore nella cancellazione' }, { status: 500 });
  }
}