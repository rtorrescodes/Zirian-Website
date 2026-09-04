import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { BaseQuotePdf } from '@/lib/pdf/BaseQuotePdf';
import { PDFDocument } from 'pdf-lib';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
function serializeQuote(quote: any) {
  if (!quote) return quote;
  return {
    ...quote,
    total: quote.total ? Number(quote.total) : 0,
    subtotal: quote.subtotal ? Number(quote.subtotal) : 0,
    impuestos: quote.impuestos ? Number(quote.impuestos) : 0,
    comision_fija: quote.comision_fija ? Number(quote.comision_fija) : 0,
    costo_real: quote.costo_real ? Number(quote.costo_real) : 0,
    utilidad_real: quote.utilidad_real ? Number(quote.utilidad_real) : 0,
    monto_pagado: quote.monto_pagado ? Number(quote.monto_pagado) : 0,
    comision_partner: quote.comision_partner ? Number(quote.comision_partner) : null,
    items: quote.items ? quote.items.map((item: any) => ({
      ...item,
      cantidad: item.cantidad ? Number(item.cantidad) : 0,
      precio_unitario: item.precio_unitario ? Number(item.precio_unitario) : 0,
      total: item.total ? Number(item.total) : 0,
      costo_unitario: item.costo_unitario ? Number(item.costo_unitario) : 0,
      cantidad_planeada: item.cantidad_planeada ? Number(item.cantidad_planeada) : 0,
      cantidad_usada: item.cantidad_usada ? Number(item.cantidad_usada) : 0,
      product: item.product ? {
        ...item.product,
        precio_base: item.product.precio_base ? Number(item.product.precio_base) : 0,
        costo_estimado: item.product.costo_estimado ? Number(item.product.costo_estimado) : null,
        stock_general: item.product.stock_general ? Number(item.product.stock_general) : 0,
      } : undefined
    })) : undefined
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const quoteId = parseInt(resolvedParams.id, 10);
    if (isNaN(quoteId)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    // Fetch quote data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: {
          include: {
            assignedUser: true
          }
        },
        items: {
          include: {
            product: true
          }
        },
        brochures: {
          include: {
            brochure: true
          }
        },
        cctvProject: true
      }
    });

    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    // Read images as base64 for foolproof PDF generation
    let logoData: string | undefined = undefined;
    let stripData: string | undefined = undefined;
    try {
      const logoBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'logo-zirian-cotizador.png'));
      logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      const stripBuffer = fs.readFileSync(path.join(process.cwd(), 'public', 'instalaciones-strip.png'));
      stripData = `data:image/png;base64,${stripBuffer.toString('base64')}`;
    } catch (e) {
      console.error('Failed to read images for PDF', e);
    }

    let agentName = quote.client?.assignedUser?.nombre || 'Ing. Rodrigo Torres';
    let template = quote.template;
    
    // Check if client is owned by a distributor
    if (quote.client?.assignedUser?.role === 'Distribuidor') {
      agentName = quote.client.assignedUser.nombre;
      if (template !== 'general_distribuidor_fotos') {
        template = 'general_distribuidor';
      }
    }

    try {
      const cookieStore = await cookies();
      const session = cookieStore.get('zirian_session');
      if (session) {
        const payload = await verifyAuth(session.value);
        if (payload.role === 'Distribuidor') {
          agentName = payload.name;
          if (template !== 'general_distribuidor_fotos') {
            template = 'general_distribuidor';
          }
        }
      }
    } catch(e) {}
    
    if (template === 'general_distribuidor' || template === 'general_distribuidor_fotos') {
      agentName = 'Polo Esponda';
    }
    
    quote.template = template;

    // Generate base PDF stream
    const plainQuote = serializeQuote(quote);
    const stream = await renderToStream(
      React.createElement(BaseQuotePdf, { quote: plainQuote, client: plainQuote.client, logoData, stripData, agentName }) as any
    );

    // Convert NodeJS Readable stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const basePdfBuffer = Buffer.concat(chunks);

    // Load base PDF into pdf-lib
    const pdfDoc = await PDFDocument.load(basePdfBuffer);

    // Fetch and merge brochures
    for (const quoteBrochure of quote.brochures) {
      const brochureUrl = quoteBrochure.brochure.file_url;
      const brochureBase64 = quoteBrochure.brochure.file_base64;
      try {
        let brochureBuffer: Buffer | null = null;
        
        if (brochureBase64) {
          brochureBuffer = Buffer.from(brochureBase64, 'base64');
        } else if (brochureUrl.startsWith('http')) {
          const response = await fetch(brochureUrl);
          if (response.ok) {
            brochureBuffer = Buffer.from(await response.arrayBuffer());
          } else {
            console.error(`Failed to fetch brochure from ${brochureUrl}`);
          }
        } else {
          // Local fallback
          const localPath = path.join(process.cwd(), 'public', brochureUrl);
          if (fs.existsSync(localPath)) {
             brochureBuffer = fs.readFileSync(localPath);
          }
        }

        if (brochureBuffer) {
          const brochureDoc = await PDFDocument.load(brochureBuffer);
          const copiedPages = await pdfDoc.copyPages(brochureDoc, brochureDoc.getPageIndices());
          copiedPages.forEach((page) => {
            pdfDoc.addPage(page);
          });
        }
      } catch (err) {
        console.error(`Error merging brochure from ${brochureUrl}`, err);
      }
    }

    // Embed CCTV Preview if exists
    if (quote.cctvProject && quote.cctvProject.previewImage) {
      try {
        const base64Data = quote.cctvProject.previewImage.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const isPng = quote.cctvProject.previewImage.includes('image/png');
        const image = isPng ? await pdfDoc.embedPng(imageBuffer) : await pdfDoc.embedJpg(imageBuffer);
        
        const page = pdfDoc.addPage([612, 792]); // Letter size
        const { width, height } = page.getSize();
        
        // Add Title
        page.drawText(`Anexo: Diseño CCTV - ${quote.cctvProject.nombre}`, {
          x: 40,
          y: height - 60,
          size: 16,
        });

        // Fit image
        const imgDims = image.scaleToFit(width - 80, height - 120);
        page.drawImage(image, {
          x: (width - imgDims.width) / 2,
          y: height - 100 - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        });
      } catch (err) {
        console.error("Error embedding CCTV preview", err);
      }
    }

    const finalPdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(finalPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Cotizacion_ZIR-${quote.id.toString().padStart(4, '0')}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return new NextResponse(`Error: ${error.message}\nStack: ${error.stack}`, { status: 500 });
  }
}
