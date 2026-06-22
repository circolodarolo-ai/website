import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint: track anonymous analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, pageUrl, productId, duration, referrer, userAgent, ipHash, country, city, sessionId } = body;

    if (!eventType || !pageUrl || !sessionId) {
      return NextResponse.json({ error: 'eventType, pageUrl, sessionId richiesti' }, { status: 400 });
    }

    await db.analyticsEvent.create({
      data: {
        sessionId,
        eventType: eventType || 'pageview',
        pageUrl,
        productId: productId || null,
        duration: duration || null,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipHash: ipHash || null,
        country: country || null,
        city: city || null,
      },
    });

    // Upsert daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 2); // UTC+2 workaround for Italy

    const existingDay = await db.analyticsDaily.findFirst({
      where: { date: today },
    });

    if (existingDay) {
      await db.analyticsDaily.update({
        where: { id: existingDay.id },
        data: { totalVisits: { increment: 1 } },
      });
    } else {
      await db.analyticsDaily.create({
        data: { date: today, totalVisits: 1, uniqueVisitors: 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}