import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Admin endpoint: read analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'daily';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const buildDateWhere = (field: string): Record<string, unknown> => {
      const filter: Record<string, unknown> = {};
      if (startDate || endDate) {
        filter[field] = {};
        if (startDate) (filter[field] as Record<string, unknown>).gte = new Date(startDate);
        if (endDate) (filter[field] as Record<string, unknown>).lte = new Date(endDate);
      }
      return filter;
    };

    if (range === 'daily') {
      const where = buildDateWhere('date');
      const [data, total] = await Promise.all([
        db.analyticsDaily.findMany({
          where,
          orderBy: { date: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsDaily.count({ where }),
      ]);
      return NextResponse.json({ data, total, page, limit, range });
    }

    if (range === 'hourly') {
      // Get hourly breakdown from a specific day or today
      const targetDate = startDate
        ? new Date(startDate)
        : new Date();
      targetDate.setHours(0, 0, 0, 0);

      // Find the daily record for the requested date
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dailyRecord = await db.analyticsDaily.findFirst({
        where: {
          date: {
            gte: targetDate,
            lt: nextDay,
          },
        },
      });

      // Parse hourly breakdown JSON from the daily record
      let hourlyData: Array<{ hour: number; visits: number; label: string }> = [];
      if (dailyRecord?.hourlyBreakdown) {
        try {
          const parsed = JSON.parse(dailyRecord.hourlyBreakdown);
          hourlyData = Object.entries(parsed)
            .map(([h, v]) => ({
              hour: parseInt(h),
              visits: (v as { visits?: number; count?: number })?.visits || (v as { visits?: number; count?: number })?.count || 0,
              label: `${h.padStart(2, '0')}:00 - ${h.padStart(2, '0')}:59`,
            }))
            .sort((a, b) => a.hour - b.hour);
        } catch {}
      }

      // If no hourly breakdown data, aggregate from events for that day
      if (hourlyData.length === 0) {
        const events = await db.analyticsEvent.findMany({
          where: {
            timestamp: {
              gte: targetDate,
              lt: nextDay,
            },
            eventType: 'pageview',
          },
          select: { timestamp: true },
        });

        const hourCounts: Record<number, number> = {};
        events.forEach((e) => {
          const h = e.timestamp.getHours();
          hourCounts[h] = (hourCounts[h] || 0) + 1;
        });

        hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          visits: hourCounts[i] || 0,
          label: `${i.toString().padStart(2, '0')}:00 - ${i.toString().padStart(2, '0')}:59`,
        }));
      }

      // Always return all 24 hours even if we had partial data
      const fullData = Array.from({ length: 24 }, (_, i) => {
        const existing = hourlyData.find((h) => h.hour === i);
        return existing || {
          hour: i,
          visits: 0,
          label: `${i.toString().padStart(2, '0')}:00 - ${i.toString().padStart(2, '0')}:59`,
        };
      });

      const totalVisits = fullData.reduce((s, h) => s + h.visits, 0);
      return NextResponse.json({
        data: fullData,
        total: fullData.length,
        page: 1,
        limit: 24,
        range: 'hourly',
        meta: {
          date: targetDate.toISOString().split('T')[0],
          totalVisits,
          peakHour: fullData.reduce((max, h) => h.visits > (fullData[max]?.visits || 0) ? fullData.indexOf(h) : max, 0),
        },
      });
    }

    if (range === 'weekly') {
      const where = buildDateWhere('weekStartDate');
      const [data, total] = await Promise.all([
        db.analyticsWeekly.findMany({
          where,
          orderBy: { weekStartDate: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.analyticsWeekly.count({ where }),
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
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
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
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) (where.timestamp as Record<string, unknown>).gte = new Date(startDate);
        if (endDate) (where.timestamp as Record<string, unknown>).lte = new Date(endDate);
      }
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

    return NextResponse.json({ error: 'Range non valido. Usa: hourly, daily, weekly, monthly, yearly, events' }, { status: 400 });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
  }
}