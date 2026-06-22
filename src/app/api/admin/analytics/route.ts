import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Admin endpoint: read analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'daily'; // daily, weekly, monthly, yearly
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (range === 'daily') {
      const [data, total] = await Promise.all([
        db.analyticsDaily.findMany({
          where: dateFilter,
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsDaily.count({ where: dateFilter }),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    if (range === 'weekly') {
      const [data, total] = await Promise.all([
        db.analyticsWeekly.findMany({
          where: dateFilter.weekStartDate ? { weekStartDate: dateFilter } : undefined,
          orderBy: { weekStartDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsWeekly.count(),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    if (range === 'monthly') {
      const month = searchParams.get('month');
      const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
      const where: Record<string, unknown> = { year };
      if (month) where.month = month;

      const [data, total] = await Promise.all([
        db.analyticsMonthly.findMany({
          where,
          orderBy: { year: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsMonthly.count({ where }),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    if (range === 'yearly') {
      const [data, total] = await Promise.all([
        db.analyticsYearly.findMany({
          orderBy: { year: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsYearly.count(),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    // Events log
    if (range === 'events') {
      const where: Record<string, unknown> = {};
      if (startDate) where.timestamp = { ...(where.timestamp as Record<string, unknown> || {}), gte: new Date(startDate) };
      if (endDate) where.timestamp = { ...(where.timestamp as Record<string, unknown> || {}), lte: new Date(endDate) };
      const eventType = searchParams.get('eventType');
      if (eventType) where.eventType = eventType;

      const [data, total] = await Promise.all([
        db.analyticsEvent.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            sessionId: true,
            eventType: true,
            pageUrl: true,
            productId: true,
            duration: true,
            referrer: true,
            country: true,
            city: true,
            timestamp: true,
          },
        }),
        db.analyticsEvent.count({ where }),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    return NextResponse.json({ error: 'Range non valido. Usa: daily, weekly, monthly, yearly, events' }, { status: 400 });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
  }
}