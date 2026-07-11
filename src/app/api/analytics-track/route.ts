import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// --- IP Geolocation Cache (in-memory, 5min TTL) ---
interface GeoData {
  country: string;
  countryCode: string;
  city: string;
  regionName: string;
  timestamp: number;
}

const geoCache = new Map<string, GeoData>();
const GEO_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getGeoFromIP(ip: string): Promise<{ country: string; city: string } | null> {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return null;

  // Check cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return { country: cached.country, city: cached.city };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,timezone`, {
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    const data = await res.json();

    if (data.status === 'success') {
      const geo: GeoData = {
        country: data.country || null,
        countryCode: data.countryCode || null,
        city: data.city || null,
        regionName: data.regionName || null,
        timestamp: Date.now(),
      };
      geoCache.set(ip, geo);

      // Prune cache every 100 lookups to prevent memory leak
      if (geoCache.size > 500) {
        const now = Date.now();
        for (const [key, val] of geoCache.entries()) {
          if (now - val.timestamp > GEO_CACHE_TTL) geoCache.delete(key);
        }
      }

      return { country: geo.country, city: geo.city };
    }
  } catch {
    // ip-api.com failed silently — we just don't store geo
  }

  return null;
}

// --- Extract real IP from request headers ---
function getClientIP(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const firstIP = xff.split(',')[0]?.trim();
    if (firstIP) return firstIP;
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '127.0.0.1';
}

// --- Get today's date in Europe/Rome timezone ---
function getTodayRome(): Date {
  const now = new Date();
  // Convert to Europe/Rome (UTC+1 / UTC+2 DST)
  const romeOffset = 1; // base UTC+1, we'll approximate
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const romeTime = new Date(utc + romeOffset * 3600000);
  // Actually use a simpler approach: format the date string in Rome timezone
  const romeStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' }); // YYYY-MM-DD
  const parts = romeStr.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

// Public endpoint: track anonymous analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, pageUrl, productId, duration, referrer, userAgent, ipHash, country: clientCountry, city: clientCity, sessionId } = body;

    if (!eventType || !pageUrl || !sessionId) {
      return NextResponse.json({ error: 'eventType, pageUrl, sessionId richiesti' }, { status: 400 });
    }

    // Get real IP and resolve geolocation via ip-api.com
    const clientIP = getClientIP(request);
    const geo = await getGeoFromIP(clientIP);
    const resolvedCountry = geo?.country || clientCountry || null;
    const resolvedCity = geo?.city || clientCity || null;

    await db.analyticsEvent.create({
      data: {
        id: randomUUID(),
        sessionId,
        eventType: eventType || 'pageview',
        pageUrl,
        productId: productId || null,
        duration: duration || null,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipHash: ipHash || null,
        country: resolvedCountry,
        city: resolvedCity,
      },
    });

    // Upsert daily stats
    const today = getTodayRome();

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
        data: {
          id: randomUUID(),
          date: today,
          totalVisits: 1,
          uniqueVisitors: 1,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Errore' }, { status: 500 });
  }
}