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

  const products = await prisma.product.findMany({
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

  return products.map(p => ({
    ...p,
    precio_base: p.precio_base ? Number(p.precio_base) : 0,
    costo_estimado: p.costo_estimado ? Number(p.costo_estimado) : null,
    stock_general: p.stock_general ? Number(p.stock_general) : 0,
    recommendations: p.recommendations.map(r => ({
      ...r,
      recommended: {
        ...r.recommended,
        precio_base: r.recommended.precio_base ? Number(r.recommended.precio_base) : 0,
        costo_estimado: r.recommended.costo_estimado ? Number(r.recommended.costo_estimado) : null,
        stock_general: r.recommended.stock_general ? Number(r.recommended.stock_general) : 0
      }
    }))
  }))
}

export async function getProductById(id: number) {
  const p = await prisma.product.findUnique({
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

  if (!p) return null;

  return {
    ...p,
    precio_base: p.precio_base ? Number(p.precio_base) : 0,
    costo_estimado: p.costo_estimado ? Number(p.costo_estimado) : null,
    stock_general: p.stock_general ? Number(p.stock_general) : 0,
    recommendations: p.recommendations.map(r => ({
      ...r,
      recommended: {
        ...r.recommended,
        precio_base: r.recommended.precio_base ? Number(r.recommended.precio_base) : 0,
        costo_estimado: r.recommended.costo_estimado ? Number(r.recommended.costo_estimado) : null,
        stock_general: r.recommended.stock_general ? Number(r.recommended.stock_general) : 0
      }
    }))
  }
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
  notas?: string;
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
      categoryId: data.categoryId,
      notas: data.notas
    }
  })
  
  revalidatePath('/admin/productos')
  return {
    ...product,
    precio_base: product.precio_base ? Number(product.precio_base) : 0,
    costo_estimado: product.costo_estimado ? Number(product.costo_estimado) : null,
    stock_general: product.stock_general ? Number(product.stock_general) : 0,
  }
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
  notas?: string;
}) {
  const product = await prisma.product.update({
    where: { id },
    data
  })
  
  revalidatePath('/admin/productos')
  return {
    ...product,
    precio_base: product.precio_base ? Number(product.precio_base) : 0,
    costo_estimado: product.costo_estimado ? Number(product.costo_estimado) : null,
    stock_general: product.stock_general ? Number(product.stock_general) : 0,
  }
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
