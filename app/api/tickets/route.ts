import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enviarCorreo } from "@/lib/mail";
import { createNotification } from "@/app/actions/notifications";
import { verifyAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

// Helper to verify admin session
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  return session && session.value === "authenticated";
}

// GET: Fetch all tickets (admin protected)
export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let isDistribuidor = false;
  let userId: number | null = null;
  try {
    const payload = await verifyAuth(session.value);
    if (payload.role === 'Distribuidor') {
      isDistribuidor = true;
      userId = payload.id;
    }
  } catch (e) {
    return NextResponse.json({ error: "Token invalido" }, { status: 401 });
  }

  const baseWhere = isDistribuidor ? { client: { assignedUserId: userId } } : {};

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: baseWhere,
      orderBy: {
        fecha_creacion: "desc",
      },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Failed to fetch tickets: ", error);
    return NextResponse.json({ error: "Error en base de datos" }, { status: 500 });
  }
}

// POST: Register a new support ticket (optional file upload)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const nombre_cliente = formData.get("nombre_cliente") as string;
    const folio_cliente = formData.get("folio_cliente") as string;
    const descripcion = formData.get("descripcion") as string;
    const file = formData.get("foto") as File | null;

    if (!nombre_cliente || !descripcion) {
      return NextResponse.json(
        { error: "El nombre y la descripción son obligatorios." },
        { status: 400 }
      );
    }

    let foto_path: string | null = null;

    // Handle file upload if present
    if (file && file.size > 0) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const fileExt = file.name.split(".").pop();
          const fileName = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

          // Resilient upload to "tickets" bucket
          const { data, error: uploadError } = await supabase.storage
            .from("tickets")
            .upload(fileName, fileBuffer, {
              contentType: file.type,
              duplex: "half",
            });

          if (uploadError) {
            console.error("Supabase Storage upload failed: ", uploadError.message);
          } else if (data) {
            // Get public URL
            const { data: urlData } = supabase.storage.from("tickets").getPublicUrl(fileName);
            foto_path = urlData?.publicUrl || null;
          }
        }
      } catch (uploadException) {
        console.error("Graceful upload error caught: ", uploadException);
        // We continue gracefully without failing the form submission
      }
    }

    // Save ticket to PostgreSQL via Prisma
    const newTicket = await prisma.supportTicket.create({
      data: {
        nombre_cliente,
        folio_cliente: folio_cliente || null,
        descripcion,
        foto_path,
        status: "Abierto",
      },
    });

    // Send email notification
    const asunto = `Nuevo Ticket de Soporte Levantado: ${nombre_cliente}`;
    let imagenHtml = "";
    if (foto_path) {
      imagenHtml = `<tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Imagen Adjunta:</td><td style='padding: 8px; border: 1px solid #ddd;'><a href='${foto_path}' target='_blank'>Ver Imagen Adjunta</a></td></tr>`;
    }

    const cuerpoHtml = `
      <div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
        <h2 style='color: #FF3366; border-bottom: 2px solid #FF0055; padding-bottom: 10px;'>Nuevo Ticket de Soporte - Zirian</h2>
        <p>Se ha levantado un nuevo reporte técnico / de garantía:</p>
        <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Nombre Cliente:</td><td style='padding: 8px; border: 1px solid #ddd;'>${nombre_cliente}</td></tr>
          <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Folio Cliente:</td><td style='padding: 8px; border: 1px solid #ddd;'>${folio_cliente || "No proporcionado"}</td></tr>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Descripción del Problema:</td><td style='padding: 8px; border: 1px solid #ddd;'>${descripcion.replace(/\n/g, "<br>")}</td></tr>
          ${imagenHtml}
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Fecha de Reporte:</td><td style='padding: 8px; border: 1px solid #ddd;'>${new Date().toLocaleString("es-MX")}</td></tr>
        </table>
        <br>
        <p style='text-align: center;'><a href='https://zirian.com/admin' style='display: inline-block; padding: 10px 20px; background-color: #FF3366; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>Ver en Dashboard CRM</a></p>
      </div>
    `;

    await enviarCorreo(asunto, cuerpoHtml);

    return NextResponse.json({
      success: true,
      message: "¡Ticket levantado exitosamente! Tu reporte ha sido recibido.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Failed to register ticket: ", error);
    return NextResponse.json({ error: "Error interno al procesar el ticket" }, { status: 500 });
  }
}

// PUT: Update ticket status (admin protected)
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y status son obligatorios" }, { status: 400 });
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket actualizado correctamente.",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Failed to update ticket: ", error);
    return NextResponse.json({ error: "Error al actualizar ticket" }, { status: 500 });
  }
}
