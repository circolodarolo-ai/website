import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Formato non supportato. Usa jpg, jpeg, png, gif o webp.' },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File troppo grande. Dimensione massima: 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine file extension from MIME type
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    const ext = extMap[file.type] || 'jpg';
    const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Write file to disk
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ url, fileName, size: file.size });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Errore nel caricamento del file' }, { status: 500 });
  }
}