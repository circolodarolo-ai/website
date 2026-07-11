import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Limite tentativi login per IP (in-memory, valido per la vita del processo)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minuti

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ─── Security Headers per tutte le risposte ───
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Content-Security-Policy (permissivo ma base)
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://pagead2.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https://flagcdn.com https://*.googleapis.com https://pagead2.googlesyndication.com https://images.unsplash.com https://*.unsplash.com",
      "connect-src 'self' https://api.mymemory.translated.net https://translate.googleapis.com https://ip-api.com",
      "frame-src https://pagead2.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // ─── Rate Limiting su login ───
  if (pathname === '/api/admin/login' && request.method === 'POST') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (attempt && attempt.count >= MAX_LOGIN_ATTEMPTS && now < attempt.resetAt) {
      return new NextResponse(
        JSON.stringify({ error: 'Troppi tentativi. Riprova tra 15 minuti.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '900' } }
      );
    }

    // Aggiorna il contatore dopo la risposta (non blocchiamo qui, lo facciamo nel finally)
    // Il rate limiting vero viene gestito lato route, qui solo il check preventivo
    if (!attempt || now >= attempt.resetAt) {
      loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    } else {
      attempt.count++;
    }
  }

  // ─── Auth Guard per le API admin (escluso login e me) ───
  if (pathname.startsWith('/api/admin/') && !pathname.startsWith('/api/admin/login') && !pathname.startsWith('/api/admin/me')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Non autenticato' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      await verifyToken(token);
    } catch {
      return new NextResponse(
        JSON.stringify({ error: 'Token non valido o scaduto' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Tutte le route API e le pagine
    '/((?!_next/static|_next/image|favicon.ico|fonts).*)',
  ],
};