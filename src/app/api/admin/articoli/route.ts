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
    const { allergeneIds, ...rest } = body;
    const articolo = await db.articolo.create({
      data: {
        id: crypto.randomUUID(),
        nome: rest.nome,
        descrizione: rest.descrizione || null,
        categoriaId: rest.categoriaId,
        prezzo: parseFloat(rest.prezzo),
        prezzoPromozionale: rest.prezzoPromozionale ? parseFloat(rest.prezzoPromozionale) : null,
        eBestChoice: rest.eBestChoice || false,
        eSurgelato: rest.eSurgelato || false,
        attivo: rest.attivo !== undefined ? rest.attivo : true,
        immagineUrl: rest.immagineUrl || null,
        updatedAt: new Date(),
      },
    });
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
    console.error('Articoli POST error:', error);
    return NextResponse.json({ error: 'Errore nella creazione' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, allergeneIds, ...data } = body;
    const articolo = await db.articolo.update({
      where: { id },
      data: {
        ...data,
        prezzo: data.prezzo !== undefined ? parseFloat(data.prezzo) : undefined,
        prezzoPromozionale: data.prezzoPromozionale !== undefined ? (data.prezzoPromozionale ? parseFloat(data.prezzoPromozionale) : null) : undefined,
        updatedAt: new Date(),
      },
    });
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
    console.error('Articoli PUT error:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
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