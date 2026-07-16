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
        immagineAiGenerata: rest.immagineAiGenerata || false,
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
    const { id, allergeneIds, immagineAiGenerata } = body;
    const data = body; // tutti i campi espliciti

    // Campi espliciti per evitare problemi di tipo con lo spread
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descrizione !== undefined) updateData.descrizione = data.descrizione || null;
    if (data.categoriaId !== undefined) updateData.categoriaId = data.categoriaId;
    if (data.prezzo !== undefined) updateData.prezzo = parseFloat(data.prezzo);
    if (data.prezzoPromozionale !== undefined) updateData.prezzoPromozionale = data.prezzoPromozionale ? parseFloat(data.prezzoPromozionale) : null;
    if (data.eBestChoice !== undefined) updateData.eBestChoice = data.eBestChoice;
    if (data.eSurgelato !== undefined) updateData.eSurgelato = data.eSurgelato;
    if (data.attivo !== undefined) updateData.attivo = data.attivo;
    if (data.immagineUrl !== undefined) updateData.immagineUrl = data.immagineUrl || null;
    if (immagineAiGenerata !== undefined) updateData.immagineAiGenerata = immagineAiGenerata;

    const articolo = await db.articolo.update({
      where: { id },
      data: updateData,
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
    return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
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