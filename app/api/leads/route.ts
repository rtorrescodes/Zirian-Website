import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { enviarCorreo } from "@/lib/mail";

// Helper to verify admin session
async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  return session && session.value === "authenticated";
}

// GET: Fetch all leads (admin protected)
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        fecha_creacion: "desc",
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch leads: ", error);
    return NextResponse.json({ error: "Error en base de datos" }, { status: 500 });
  }
}

// POST: Register a new lead from landing/estimator
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nombre,
      telefono,
      email,
      ubicacion,
      marca_ev,
      tipo_instalacion,
      distancia_centro_carga,
      tipo_lead = "Contacto Directo",
    } = body;

    // Validation
    if (!nombre || !telefono || !ubicacion) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes (nombre, telefono, ubicacion)." },
        { status: 400 }
      );
    }

    // Insert into DB
    const newLead = await prisma.lead.create({
      data: {
        nombre,
        telefono,
        email: email || null,
        marca_ev: marca_ev || null,
        tipo_instalacion: tipo_instalacion || null,
        distancia_centro_carga: distancia_centro_carga || null,
        tipo_lead,
        ubicacion,
        status: "Nuevo",
      },
    });

    // Send email notification
    const asunto = `Nuevo Lead registrado: ${nombre} (${tipo_lead})`;
    const cuerpoHtml = `
      <div style='font-family: Arial, sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;'>
        <h2 style='color: #0066FF; border-bottom: 2px solid #00D2FF; padding-bottom: 10px;'>Nuevo Registro en Zirian Website</h2>
        <p>Se ha recibido un nuevo registro de lead:</p>
        <table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Nombre:</td><td style='padding: 8px; border: 1px solid #ddd;'>${nombre}</td></tr>
          <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Teléfono / WhatsApp:</td><td style='padding: 8px; border: 1px solid #ddd;'>${telefono}</td></tr>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Email:</td><td style='padding: 8px; border: 1px solid #ddd;'>${email || "No proporcionado"}</td></tr>
          <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Ubicación:</td><td style='padding: 8px; border: 1px solid #ddd;'>${ubicacion}</td></tr>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tipo de Lead:</td><td style='padding: 8px; border: 1px solid #ddd;'>${tipo_lead}</td></tr>
          <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Marca EV:</td><td style='padding: 8px; border: 1px solid #ddd;'>${marca_ev || "N/A"}</td></tr>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Tipo Instalación:</td><td style='padding: 8px; border: 1px solid #ddd;'>${tipo_instalacion || "N/A"}</td></tr>
          <tr><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Distancia Carga:</td><td style='padding: 8px; border: 1px solid #ddd;'>${distancia_centro_carga || "N/A"}</td></tr>
          <tr style='background-color: #f9f9f9;'><td style='padding: 8px; border: 1px solid #ddd; font-weight: bold;'>Fecha Registro:</td><td style='padding: 8px; border: 1px solid #ddd;'>${new Date().toLocaleString("es-MX")}</td></tr>
        </table>
        <br>
        <p style='text-align: center;'><a href='https://zirian.com/admin' style='display: inline-block; padding: 10px 20px; background-color: #0066FF; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;'>Ver en Dashboard CRM</a></p>
      </div>
    `;

    await enviarCorreo(asunto, cuerpoHtml);

    return NextResponse.json({
      success: true,
      message: "¡Cotización / Lead registrado con éxito!",
      lead: newLead,
    });
  } catch (error) {
    console.error("Failed to register lead: ", error);
    return NextResponse.json({ error: "Error interno al guardar lead" }, { status: 500 });
  }
}

// PUT: Update lead status or scheduled visit date (admin protected)
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, fecha_visita } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de lead obligatorio" }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) {
      updateData.status = status;
    }

    if (fecha_visita !== undefined) {
      updateData.fecha_visita = fecha_visita ? new Date(fecha_visita) : null;
    }

    // Reset visit date if status is not Visita Programada
    if (status !== "Visita Programada" && status !== undefined) {
      updateData.fecha_visita = null;
    }

    const updatedLead = await prisma.lead.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Lead actualizado correctamente.",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Failed to update lead: ", error);
    return NextResponse.json({ error: "Error al actualizar lead" }, { status: 500 });
  }
}
