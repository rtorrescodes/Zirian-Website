import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { BaseQuotePdf } from '@/lib/pdf/BaseQuotePdf';
import { PDFDocument } from 'pdf-lib';
import React from 'react';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id, 10);
    if (isNaN(quoteId)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    // Fetch quote data
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
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

    // Generate base PDF stream
    const stream = await renderToStream(
      React.createElement(BaseQuotePdf, { quote, client: quote.client }) as any
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
      try {
        let brochureBuffer: Buffer | null = null;
        
        // If it's a URL, fetch it. Otherwise assume local public path (for testing/legacy)
        if (brochureUrl.startsWith('http')) {
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
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
