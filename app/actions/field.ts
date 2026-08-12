"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Fallback logic for storing files locally in `public/uploads` when GCS is not yet configured.
async function uploadToStorage(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const extension = file.name.split('.').pop() || 'jpg';
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const filename = `${uniqueId}_${Date.now()}.${extension}`;
  
  // Ensure directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await fs.mkdir(uploadDir, { recursive: true });
  
  // Write file
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  
  // Return public URL path
  return `/uploads/${folder}/${filename}`;
}

export async function getTechnicianTasks(tecnicoId?: number) {
  // In a real app we would filter by the logged-in tecnicoId.
  // For now, let's fetch pending ServiceOrders and ScoutingReports
  
  const scoutingReports = await prisma.scoutingReport.findMany({
    where: { status: { not: "Completado" } },
    include: {
      client: true,
      photos: true
    },
    orderBy: { fecha_visita: 'asc' }
  });

  const serviceOrders = await prisma.serviceOrder.findMany({
    where: { status: { not: "Completada" } },
    include: {
      quote: {
        include: {
          client: true,
          items: true
        }
      },
      photos: true,
      installedMaterials: true
    },
    orderBy: { fecha_programada: 'asc' }
  });

  return { scoutingReports, serviceOrders };
}

export async function getScoutingReport(id: number) {
  return await prisma.scoutingReport.findUnique({
    where: { id },
    include: { client: true, photos: true }
  });
}

export async function getServiceOrder(id: number) {
  return await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      quote: { include: { client: true, items: { include: { product: true } } } },
      photos: true,
      installedMaterials: true
    }
  });
}

export async function uploadScoutingPhoto(formData: FormData) {
  const file = formData.get("file") as File | null;
  const reportId = parseInt(formData.get("reportId") as string, 10);
  const description = formData.get("description") as string | null;

  if (!file || isNaN(reportId)) throw new Error("Missing required fields");

  const url = await uploadToStorage(file, 'scouting');

  const photo = await prisma.scoutingPhoto.create({
    data: {
      reportId: reportId,
      url,
      descripcion: description || ""
    }
  });

  revalidatePath(`/tecnico/scouting/${reportId}`);
  return photo;
}

export async function uploadInstallationPhoto(formData: FormData) {
  const file = formData.get("file") as File | null;
  const orderId = parseInt(formData.get("orderId") as string, 10);
  const description = formData.get("description") as string | null;

  if (!file || isNaN(orderId)) throw new Error("Missing required fields");

  const url = await uploadToStorage(file, 'installations');

  const photo = await prisma.installationPhoto.create({
    data: {
      serviceOrderId: orderId,
      url,
      descripcion: description || ""
    }
  });

  revalidatePath(`/tecnico/orden/${orderId}`);
  return photo;
}

export async function updateTaskStatus(taskId: number, type: 'scouting' | 'installation', status: string) {
  if (type === 'scouting') {
    await prisma.scoutingReport.update({
      where: { id: taskId },
      data: { status }
    });
    revalidatePath(`/tecnico/scouting/${taskId}`);
  } else {
    await prisma.serviceOrder.update({
      where: { id: taskId },
      data: { status }
    });
    revalidatePath(`/tecnico/orden/${taskId}`);
  }
  revalidatePath('/tecnico');
}

export async function toggleBOMItem(itemId: number, isChecked: boolean, cantidad: number) {
  try {
    const updated = await prisma.quoteItem.update({
      where: { id: itemId },
      data: {
        cantidad_usada: isChecked ? cantidad : 0
      }
    });
    revalidatePath('/tecnico/orden/[id]', 'page');
    revalidatePath('/admin/cotizaciones/[id]', 'page');
    return updated;
  } catch (error) {
    console.error("Error toggling BOM item:", error);
    throw new Error("Failed to toggle BOM item");
  }
}
