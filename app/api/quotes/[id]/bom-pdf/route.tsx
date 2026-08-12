import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import { BomPdf } from '@/lib/pdf/BomPdf';
import React from 'react';

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
        }
      }
    });

    if (!quote) {
      return new NextResponse('Quote not found', { status: 404 });
    }

    // Serialize Decimal properties for Client Components (PDF uses normal numbers)
    const serializedQuote = {
      ...quote,
      items: quote.items.map((item: any) => ({
        ...item,
        cantidad: Number(item.cantidad),
        precio_unitario: Number(item.precio_unitario),
        total: Number(item.total),
        product: item.product ? {
          ...item.product,
          precio_base: Number(item.product.precio_base),
          stock_general: Number(item.product.stock_general),
        } : undefined
      }))
    };

    // Render basic BOM document
    const stream = await renderToStream(<BomPdf quote={serializedQuote} logoData={null} />);

    // Retornamos el stream base (sin brochures adjuntos para que sea más ligero)
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="BOM_COT-${quoteId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating BOM PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
