import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'documentos';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    const finalName = `${timestamp}-${cleanName}`;
    const fileUrl = `/uploads/${folder}/${finalName}`;

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, finalName);
      fs.writeFileSync(filePath, buffer);
    } catch(e) {
      console.warn('Could not write to local FS (Vercel), continuing for base64');
    }
    
    const nombre = (formData.get('nombre') as string) || cleanName;
    const brochure = await prisma.brochure.create({
      data: {
        nombre: nombre,
        file_url: fileUrl,
        file_base64: buffer.toString('base64'),
        activo: true
      }
    });

    return NextResponse.json({ url: fileUrl, brochure });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
