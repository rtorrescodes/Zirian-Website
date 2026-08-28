"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBrochures() {
  return await prisma.brochure.findMany({
    orderBy: { fecha_creacion: 'desc' }
  })
}

export async function createBrochure(data: { nombre: string, file_url: string, file_base64?: string }) {
  const brochure = await prisma.brochure.create({
    data: {
      nombre: data.nombre,
      file_url: data.file_url,
      file_base64: data.file_base64,
      activo: true
    }
  })
  revalidatePath('/admin/configuracion/documentos')
  revalidatePath('/admin/cotizador')
  return brochure
}

export async function deleteBrochure(id: number) {
  await prisma.brochure.delete({
    where: { id }
  })
  revalidatePath('/admin/configuracion/documentos')
  revalidatePath('/admin/cotizador')
}
