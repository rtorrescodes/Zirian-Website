'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts(query = '', categoryId?: number) {
  const where: any = {}
  
  if (query) {
    where.OR = [
      { nombre: { contains: query, mode: 'insensitive' } },
      { codigo: { contains: query, mode: 'insensitive' } },
      { descripcion: { contains: query, mode: 'insensitive' } }
    ]
  }

  if (categoryId) {
    where.categoryId = categoryId
  }

  return await prisma.product.findMany({
    where,
    include: {
      category: true,
      recommendations: {
        include: {
          recommended: true
        }
      }
    },
    orderBy: { nombre: 'asc' }
  })
}

export async function getProductById(id: number) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      recommendations: {
        include: {
          recommended: true
        }
      }
    }
  })
}

export async function getCategories() {
  return await prisma.productCategory.findMany({
    orderBy: { nombre: 'asc' }
  })
}

export async function createCategory(data: { nombre: string; descripcion?: string }) {
  const cat = await prisma.productCategory.create({
    data
  })
  revalidatePath('/admin/productos')
  return cat
}

export async function createProduct(data: {
  nombre: string;
  codigo?: string;
  marca?: string;
  proveedor_default?: string;
  descripcion?: string;
  precio_base: number;
  costo_estimado?: number;
  unidad_medida?: string;
  activo?: boolean;
  categoryId: number;
}) {
  const product = await prisma.product.create({
    data: {
      nombre: data.nombre,
      codigo: data.codigo,
      marca: data.marca,
      proveedor_default: data.proveedor_default,
      descripcion: data.descripcion,
      precio_base: data.precio_base,
      costo_estimado: data.costo_estimado,
      unidad_medida: data.unidad_medida || 'Pieza',
      activo: data.activo !== undefined ? data.activo : true,
      categoryId: data.categoryId
    }
  })
  
  revalidatePath('/admin/productos')
  return product
}

export async function updateProduct(id: number, data: {
  nombre?: string;
  codigo?: string;
  marca?: string;
  proveedor_default?: string;
  descripcion?: string;
  precio_base?: number;
  costo_estimado?: number;
  unidad_medida?: string;
  activo?: boolean;
  categoryId?: number;
}) {
  const product = await prisma.product.update({
    where: { id },
    data
  })
  
  revalidatePath('/admin/productos')
  return product
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id }
  })
  revalidatePath('/admin/productos')
}

export async function addRecommendation(productId: number, recommendedId: number) {
  const rec = await prisma.productRecommendation.create({
    data: {
      productId,
      recommendedId
    }
  })
  revalidatePath(`/admin/productos/editor/${productId}`)
  return rec
}

export async function removeRecommendation(productId: number, recommendedId: number) {
  await prisma.productRecommendation.delete({
    where: {
      productId_recommendedId: {
        productId,
        recommendedId
      }
    }
  })
  revalidatePath(`/admin/productos/editor/${productId}`)
}
