import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const articoli = await db.articolo.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Categoria: true,
        AllergeneArticolo: { include: { Allergene: true } },
      },
    });
    // Remap for frontend compatibility
    const mapped = articoli.map(a => ({
      ...a,
      categoria: a.Categoria,
      allergeni: a.AllergeneArticolo.map(aa => ({
        ...aa,
        allergene: aa.Allergene,
      })),
    }));
    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Articoli GET error:', error);
    return NextResponse.json({ error: 'Errore nel recupero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[POST /api/admin/articoli] Body ricevuto, keys:', Object.keys(body));
    const { allergeneIds, immagineAiGenerata, ...rest } = body;

    const prezzo = typeof rest.prezzo === 'number' ? rest.prezzo : parseFloat(rest.prezzo);
    const prezzoPromozionale = rest.prezzoPromozionale
      ? (typeof rest.prezzoPromozionale === 'number' ? rest.prezzoPromozionale : parseFloat(rest.prezzoPromozionale))
      : null;

    console.log('[POST /api/admin/articoli] Dati parsed:', {
      nome: rest.nome,
      prezzo,
      prezzoPromozionale,
      immagineUrl: rest.immagineUrl ? `[${String(rest.immagineUrl).length} chars]` : null,
      immagineAiGenerata,
    });

    const articolo = await db.articolo.create({
      data: {
        id: crypto.randomUUID(),
        nome: String(rest.nome || '').trim(),
        descrizione: rest.descrizione ? String(rest.descrizione).trim() : null,
        categoriaId: rest.categoriaId,
        prezzo,
        prezzoPromozionale,
        eBestChoice: !!rest.eBestChoice,
        eSurgelato: !!rest.eSurgelato,
        attivo: rest.attivo !== undefined ? !!rest.attivo : true,
        immagineUrl: rest.immagineUrl || null,
        immagineAiGenerata: !!immagineAiGenerata,
        updatedAt: new Date(),
      },
    });

    console.log('[POST /api/admin/articoli] Creato ID:', articolo.id);

    // Save allergeni relations
    if (Array.isArray(allergeneIds) && allergeneIds.length > 0) {
      await db.allergeneArticolo.createMany({
        data: allergeneIds.map((allergeneId: string) => ({
          id: crypto.randomUUID(),
          articoloId: articolo.id,
          allergeneId,
        })),
      });
    }

    return NextResponse.json(articolo, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/articoli] Errore:', error);
    const msg = error instanceof Error ? error.message : 'Errore nella creazione';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[PUT /api/admin/articoli] Body ricevuto, keys:', Object.keys(body));

    const { id, allergeneIds, immagineAiGenerata, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID mancante' }, { status: 400 });
    }

    const prezzo = data.prezzo !== undefined
      ? (typeof data.prezzo === 'number' ? data.prezzo : parseFloat(data.prezzo))
      : undefined;
    const prezzoPromozionale = data.prezzoPromozionale !== undefined
      ? (data.prezzoPromozionale ? (typeof data.prezzoPromozionale === 'number' ? data.prezzoPromozionale : parseFloat(data.prezzoPromozionale)) : null)
      : undefined;

    console.log('[PUT /api/admin/articoli] Dati parsed:', {
      id,
      nome: data.nome,
      prezzo,
      prezzoPromozionale,
      immagineUrl: data.immagineUrl ? `[${String(data.immagineUrl).length} chars]` : null,
      immagineAiGenerata,
    });

    const articolo = await db.articolo.update({
      where: { id },
      data: {
        nome: data.nome !== undefined ? String(data.nome).trim() : undefined,
        descrizione: data.descrizione !== undefined ? (data.descrizione ? String(data.descrizione).trim() : null) : undefined,
        categoriaId: data.categoriaId,
        prezzo,
        prezzoPromozionale,
        eBestChoice: data.eBestChoice !== undefined ? !!data.eBestChoice : undefined,
        eSurgelato: data.eSurgelato !== undefined ? !!data.eSurgelato : undefined,
        attivo: data.attivo !== undefined ? !!data.attivo : undefined,
        immagineUrl: data.immagineUrl !== undefined ? (data.immagineUrl || null) : undefined,
        immagineAiGenerata: immagineAiGenerata !== undefined ? !!immagineAiGenerata : undefined,
        updatedAt: new Date(),
      },
    });

    console.log('[PUT /api/admin/articoli] Aggiornato ID:', articolo.id);

    // Update allergeni: delete old, create new
    if (Array.isArray(allergeneIds)) {
      await db.allergeneArticolo.deleteMany({
        where: { articoloId: id },
      });
      if (allergeneIds.length > 0) {
        await db.allergeneArticolo.createMany({
          data: allergeneIds.map((allergeneId: string) => ({
            id: crypto.randomUUID(),
            articoloId: id,
            allergeneId,
          })),
        });
      }
    }

    return NextResponse.json(articolo);
  } catch (error) {
    console.error('[PUT /api/admin/articoli] Errore:', error);
    const msg = error instanceof Error ? error.message : "Errore nell'aggiornamento";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID richiesto' }, { status: 400 });
    await db.articolo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Articoli DELETE error:', error);
    return NextResponse.json({ error: 'Errore nell\'eliminazione' }, { status: 500 });
  }
}