import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// The DB may contain events with eventType 'page_view' (old system)
// or 'pageview' (new hook). We accept BOTH.
const PAGEVIEW_TYPES = ['pageview', 'page_view'];
const SESSION_END_TYPES = ['session_end', 'session_end'];

// Helper: parse userAgent into device/browser/os
function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = 'Desktop';
  let browser = 'Altro';
  let os = 'Altro';
  if (!ua) return { device, browser, os };

  if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) device = 'Mobile';
  else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = 'Tablet';

  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { device, browser, os };
}

// Helper: parse referrer into source category
function parseReferrer(referrer: string | null): string {
  if (!referrer) return 'Diretto';
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes('google')) return 'Google';
    if (host.includes('facebook') || host.includes('fb.')) return 'Facebook';
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('tiktok')) return 'TikTok';
    if (host.includes('twitter') || host.includes('x.com')) return 'Twitter/X';
    if (host.includes('linkedin')) return 'LinkedIn';
    if (host.includes('tripadvisor')) return 'TripAdvisor';
    if (host.includes('justeat')) return 'JustEat';
    if (host.includes('deliveroo')) return 'Deliveroo';
    if (host.includes('bing')) return 'Bing';
    if (host.includes('yahoo')) return 'Yahoo';
    if (host.includes('duckduckgo')) return 'DuckDuckGo';
    return 'Altro Sito';
  } catch {
    return 'Diretto';
  }
}

// All dates in DB are stored as UTC timestamps via Prisma/PostgreSQL.
// We use UTC dates for all comparisons to avoid timezone issues.
function utcDaysAgo(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

function utcToday(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function utcTomorrow(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function utcYesterday(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - 1);
  return d;
}

// Format a Date to YYYY-MM-DD in UTC
function toUTCDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Build a pageview where clause that accepts both 'pageview' and 'page_view'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pvWhere(extra?: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w: any = { eventType: { in: PAGEVIEW_TYPES } };
  if (extra) Object.assign(w, extra);
  return w;
}

// Build a session_end where clause
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sessionEndWhere(extra?: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w: any = { eventType: { in: SESSION_END_TYPES }, duration: { gt: 0 } };
  if (extra) Object.assign(w, extra);
  return w;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const insight = searchParams.get('insight') || 'overview';
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = utcDaysAgo(days);
    const endDate = utcTomorrow(); // include all of today UTC

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateFilter: any = { timestamp: { gte: startDate, lt: endDate } };

    if (insight === 'overview') {
      const allPageviews = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { timestamp: true, sessionId: true, pageUrl: true },
        orderBy: { timestamp: 'asc' },
      });

      // Group by UTC date
      const dailyMap: Record<string, { visits: number; sessions: Set<string> }> = {};
      allPageviews.forEach(e => {
        const dateStr = toUTCDateStr(e.timestamp);
        if (!dailyMap[dateStr]) dailyMap[dateStr] = { visits: 0, sessions: new Set() };
        dailyMap[dateStr].visits++;
        dailyMap[dateStr].sessions.add(e.sessionId);
      });

      const dailyVisits = Object.entries(dailyMap)
        .map(([dateStr, data]) => ({
          date: dateStr,
          label: (() => {
            const [y, m, d] = dateStr.split('-');
            return `${d}/${m}`;
          })(),
          visits: data.visits,
          uniqueVisitors: data.sessions.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Total visits & unique visitors
      const totalVisits = allPageviews.length;
      const allSessions = new Set(allPageviews.map(e => e.sessionId));
      const uniqueVisitors = allSessions.size;

      // Avg session duration
      const durationEvents = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: SESSION_END_TYPES }, duration: { gt: 0 } },
        select: { duration: true },
      });
      const avgDuration = durationEvents.length > 0
        ? Math.round(durationEvents.reduce((s, e) => s + (e.duration || 0), 0) / durationEvents.length)
        : 0;

      // Today's visits (UTC)
      const todayStart = utcToday();
      const todayVisits = allPageviews.filter(e => e.timestamp >= todayStart).length;

      // Yesterday visits
      const yesterdayStart = utcYesterday();
      const yesterdayVisits = allPageviews.filter(e => e.timestamp >= yesterdayStart && e.timestamp < todayStart).length;
      const dailyChange = yesterdayVisits > 0 ? Math.round(((todayVisits - yesterdayVisits) / yesterdayVisits) * 100) : 0;

      // Top 5 pages
      const pageMap: Record<string, number> = {};
      allPageviews.forEach(e => { pageMap[e.pageUrl] = (pageMap[e.pageUrl] || 0) + 1; });
      const topPages = Object.entries(pageMap)
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Hourly distribution (use Rome timezone for display)
      const hourlyCounts: Record<number, number> = {};
      allPageviews.forEach(e => {
        // Convert UTC timestamp to Rome hour for display
        const romeHour = new Date(e.timestamp.getTime() + 2 * 3600000).getUTCHours();
        hourlyCounts[romeHour] = (hourlyCounts[romeHour] || 0) + 1;
      });
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        label: `${i.toString().padStart(2, '0')}:00`,
        visits: hourlyCounts[i] || 0,
      }));

      return NextResponse.json({
        dailyVisits,
        totalVisits,
        uniqueVisitors,
        avgDuration,
        todayVisits,
        yesterdayVisits,
        dailyChange,
        topPages,
        hourlyData,
        daysRange: days,
      });
    }

    if (insight === 'geo') {
      const events = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { country: true, city: true },
      });

      const countryMap: Record<string, number> = {};
      const cityMap: Record<string, { city: string; country: string; count: number }> = {};

      events.forEach(e => {
        if (e.country) {
          countryMap[e.country] = (countryMap[e.country] || 0) + 1;
        }
        const key = e.city ? `${e.city}, ${e.country}` : e.country || 'Sconosciuto';
        cityMap[key] = {
          city: e.city || 'Sconosciuto',
          country: e.country || '',
          count: (cityMap[key]?.count || 0) + 1,
        };
      });

      const countries = Object.entries(countryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      const cities = Object.values(cityMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      return NextResponse.json({
        countries,
        cities,
        totalWithGeo: events.filter(e => e.country).length,
        totalAll: events.length,
      });
    }

    if (insight === 'pages') {
      const events = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { pageUrl: true },
      });

      const pageMap: Record<string, number> = {};
      events.forEach(e => { pageMap[e.pageUrl] = (pageMap[e.pageUrl] || 0) + 1; });

      const topPages = Object.entries(pageMap)
        .map(([page, visits]) => ({ page, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 20);

      // Average duration per page
      const durationByPage: Record<string, number[]> = {};
      const durationEvents = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: SESSION_END_TYPES }, duration: { gt: 0 } },
        select: { pageUrl: true, duration: true },
      });
      durationEvents.forEach(de => {
        if (!durationByPage[de.pageUrl]) durationByPage[de.pageUrl] = [];
        durationByPage[de.pageUrl].push(de.duration || 0);
      });

      return NextResponse.json({
        pages: topPages.map(p => {
          const durations = durationByPage[p.page] || [];
          const avgDur = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
          return {
            page: p.page,
            visits: p.visits,
            avgDuration: avgDur,
            label: formatPageLabel(p.page),
          };
        }),
      });
    }

    if (insight === 'referrers') {
      const events = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { referrer: true },
      });

      const sourceMap: Record<string, number> = {};
      events.forEach(e => {
        const source = parseReferrer(e.referrer);
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      });

      const sources = Object.entries(sourceMap)
        .map(([name, count]) => ({ name, count, percentage: 0 }))
        .sort((a, b) => b.count - a.count);

      const total = sources.reduce((s, s2) => s + s2.count, 0);
      sources.forEach(s => { s.percentage = total > 0 ? Math.round((s.count / total) * 100) : 0; });

      return NextResponse.json({ sources, total });
    }

    if (insight === 'devices') {
      const events = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { userAgent: true },
      });

      const deviceMap: Record<string, number> = {};
      const browserMap: Record<string, number> = {};
      const osMap: Record<string, number> = {};

      events.forEach(e => {
        const { device, browser, os } = parseUserAgent(e.userAgent || '');
        deviceMap[device] = (deviceMap[device] || 0) + 1;
        browserMap[browser] = (browserMap[browser] || 0) + 1;
        osMap[os] = (osMap[os] || 0) + 1;
      });

      const toArr = (map: Record<string, number>) =>
        Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

      return NextResponse.json({ devices: toArr(deviceMap), browsers: toArr(browserMap), os: toArr(osMap) });
    }

    if (insight === 'sessions') {
      // Session depth: how many pageviews per session
      const allPv = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: PAGEVIEW_TYPES } },
        select: { sessionId: true },
      });

      const sessionCounts: Record<string, number> = {};
      allPv.forEach(e => { sessionCounts[e.sessionId] = (sessionCounts[e.sessionId] || 0) + 1; });

      const depthMap: Record<string, number> = {};
      Object.values(sessionCounts).forEach(depth => {
        let label: string;
        if (depth === 1) label = '1 pagina';
        else if (depth <= 3) label = '2-3 pagine';
        else if (depth <= 5) label = '4-5 pagine';
        else if (depth <= 10) label = '6-10 pagine';
        else label = '10+ pagine';
        depthMap[label] = (depthMap[label] || 0) + 1;
      });

      const depthData = Object.entries(depthMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => {
          const order = ['1 pagina', '2-3 pagine', '4-5 pagine', '6-10 pagine', '10+ pagine'];
          return order.indexOf(a.name) - order.indexOf(b.name);
        });

      const totalSessions = Object.keys(sessionCounts).length;
      const singlePage = Object.values(sessionCounts).filter(c => c === 1).length;
      const bounceRate = totalSessions > 0 ? Math.round((singlePage / totalSessions) * 100) : 0;

      // Duration distribution
      const durationEvents = await db.analyticsEvent.findMany({
        where: { ...dateFilter, eventType: { in: SESSION_END_TYPES }, duration: { gt: 0 } },
        select: { duration: true },
      });

      const durationBuckets: Record<string, number> = {
        '0-10s': 0, '10-30s': 0, '30-60s': 0, '1-3min': 0, '3-5min': 0, '5-10min': 0, '10+min': 0,
      };
      durationEvents.forEach(e => {
        const d = e.duration || 0;
        if (d <= 10) durationBuckets['0-10s']++;
        else if (d <= 30) durationBuckets['10-30s']++;
        else if (d <= 60) durationBuckets['30-60s']++;
        else if (d <= 180) durationBuckets['1-3min']++;
        else if (d <= 300) durationBuckets['3-5min']++;
        else if (d <= 600) durationBuckets['5-10min']++;
        else durationBuckets['10+min']++;
      });

      const durationData = Object.entries(durationBuckets).map(([name, count]) => ({ name, count }));

      return NextResponse.json({ depthData, bounceRate, totalSessions, durationData });
    }

    return NextResponse.json({ error: 'Insight non valido. Usa: overview, geo, pages, referrers, devices, sessions' }, { status: 400 });
  } catch (error) {
    console.error('Analytics insights error:', error);
    return NextResponse.json({ error: 'Errore nel recupero insights' }, { status: 500 });
  }
}

function formatPageLabel(path: string): string {
  const labels: Record<string, string> = {
    '/': 'Homepage',
    '/menu': 'Menu',
    '/eventi': 'Eventi',
    '/prenota': 'Prenotazioni',
  };
  if (labels[path]) return labels[path];
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return 'Homepage';
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
}