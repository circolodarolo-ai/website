import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy per le immagini generate da Pollination AI.
 * Risolve il problema CORS: il browser non contatta direttamente Pollination,
 * ma il nostro server fa la richiesta server-to-server (senza CORS) e
 * restituisce l'immagine al browser come risposta same-origin.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  const seed = searchParams.get('seed') || String(Math.floor(Math.random() * 999999));
  const width = searchParams.get('width') || '1024';
  const height = searchParams.get('height') || '768';

  if (!prompt) {
    return NextResponse.json({ error: 'Parametro "prompt" richiesto' }, { status: 400 });
  }

  const pollinationUrl = `https://image.pollination.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 secondi di timeout server-side

    const res = await fetch(pollinationUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RestaurantAdminPanel/1.0',
        'Accept': 'image/*',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Pollination ha restituito status ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'Content-Length': String(imageBuffer.byteLength),
        // CORS non necessario per same-origin, ma lo mettiamo per sicurezza
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Errore sconosciuto';
    if (message.includes('abort') || message.includes('timeout')) {
      return NextResponse.json({ error: 'Timeout: generazione troppo lenta' }, { status: 504 });
    }
    console.error('Proxy AI image error:', message);
    return NextResponse.json({ error: `Errore proxy: ${message}` }, { status: 500 });
  }
}