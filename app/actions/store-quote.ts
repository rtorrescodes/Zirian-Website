'use server';

import { prisma } from '@/lib/prisma';
import { enviarCorreo } from '@/lib/mail';
import { revalidatePath } from 'next/cache';

export interface StoreAcQuoteInput {
  productId: string;
  productTitle: string;
  productModel: string;
  productBrand: string;
  quantity: number;
  unitPrice: number;
  total: number;
  region: 'riviera_maya' | 'baja_california_sur';
  city: string;
  requiresInstallation: boolean;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address?: string;
  notes?: string;
}

export async function submitStoreAcQuote(data: StoreAcQuoteInput) {
  try {
    const isRivieraMaya = data.region === 'riviera_maya';
    const regionName = isRivieraMaya ? 'Riviera Maya' : 'Baja California Sur';

    // 1. Create client lead in DB
    const newClient = await prisma.client.create({
      data: {
        nombre: data.clientName,
        telefono: data.clientPhone,
        email: data.clientEmail || null,
        ubicacion: `${data.city}, ${isRivieraMaya ? 'Quintana Roo' : 'Baja California Sur'}${data.address ? ' - ' + data.address : ''}`,
        ciudad: data.city,
        status: 'Lead',
        origen: isRivieraMaya ? 'Tienda Web - Riviera Maya (Polo)' : 'Tienda Web - BCS',
        notas: `Cotización desde Tienda: ${data.quantity}x ${data.productModel} (${data.productTitle}). Requiere instalación: ${data.requiresInstallation ? 'SÍ' : 'NO'}. Dirección: ${data.address || 'N/A'}. Notas: ${data.notes || 'Ninguna'}`,
        assignedUserId: isRivieraMaya ? 4 : null, // Assigned to Polo if Riviera Maya
      },
    });

    // 2. Prepare Email Notification
    const destinatario = isRivieraMaya ? 'polo@roque360.com' : 'rodrigo@zirian.com';
    const asunto = `Nueva Solicitud de Cotización [${regionName}]: ${data.productModel} (${data.quantity} pzas)`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b1120; color: #f1f5f9; padding: 24px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; margin: 0 0 6px 0; text-transform: uppercase; font-size: 20px; letter-spacing: 1px;">
            Zirian Climatización & Minisplits
          </h2>
          <span style="background-color: ${isRivieraMaya ? '#065f46' : '#1e3a8a'}; color: ${isRivieraMaya ? '#6ee7b7' : '#93c5fd'}; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
            Zona: ${regionName} (${data.city})
          </span>
        </div>

        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Has recibido una nueva solicitud de cotización generada directamente desde la tienda en línea:
        </p>

        <!-- Datos del Cliente -->
        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #38bdf8;">
          <h3 style="color: #f8fafc; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase;">Datos del Cliente</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Nombre:</strong> ${data.clientName}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Teléfono:</strong> <a href="tel:${data.clientPhone}" style="color: #38bdf8;">${data.clientPhone}</a></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${data.clientEmail || 'No proporcionado'}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Ubicación / Ciudad:</strong> ${data.city} (${regionName})</p>
          ${data.address ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Dirección para Instalación:</strong> ${data.address}</p>` : ''}
          ${data.notes ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Comentarios:</strong> ${data.notes}</p>` : ''}
        </div>

        <!-- Detalles del Equipo -->
        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #f8fafc; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase;">Detalle del Equipo Cotizado</h3>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Equipo:</strong> ${data.productTitle}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Modelo:</strong> ${data.productModel} | Marca: ${data.productBrand}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Cantidad:</strong> ${data.quantity} unidad(es)</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Precio Cotizado por Unidad:</strong> $${data.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</p>
          <p style="margin: 4px 0; font-size: 14px; font-weight: bold; color: #10b981;">
            Total Estimado de Equipos: $${data.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
          </p>
          <div style="margin-top: 12px; padding: 8px 12px; background-color: ${data.requiresInstallation ? '#064e3b' : '#334155'}; border-radius: 6px;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; color: ${data.requiresInstallation ? '#a7f3d0' : '#94a3b8'};">
              🛠️ Instalación Profesional Requerida: ${data.requiresInstallation ? 'SÍ (Agendar visita técnica)' : 'SOLO SUMINISTRO DE EQUIPO'}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://wa.me/52${data.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${data.clientName}, te contacto de Zirian Climatización respecto a tu cotización de ${data.quantity} minisplit(s) ${data.productModel}.`)}" 
             style="display: inline-block; background-color: #25d366; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Contactar por WhatsApp al Cliente
          </a>
        </div>

        <div style="border-top: 1px solid #334155; margin-top: 24px; padding-top: 12px; text-align: center; font-size: 11px; color: #64748b;">
          Zirian Web Store • Prospecto guardado en CRM (ID #${newClient.id})
        </div>
      </div>
    `;

    // Send email to the designated agent (Polo or Rodrigo)
    await enviarCorreo(asunto, htmlBody, destinatario);

    // Also send notification to Rodrigo if it was for Polo (for monitoring)
    if (isRivieraMaya) {
      await enviarCorreo(`[COPIA RM] ${asunto}`, htmlBody, 'rodrigo@zirian.com');
    }

    revalidatePath('/admin/clientes');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      clientId: newClient.id,
      message: 'Tu solicitud de cotización ha sido recibida con éxito. Un ingeniero se pondrá en contacto contigo a la brevedad.',
    };
  } catch (error: any) {
    console.error('Error submitting store AC quote:', error);
    return {
      success: false,
      message: 'Ocurrió un error al procesar tu solicitud. Por favor contáctanos directamente por WhatsApp.',
    };
  }
}
