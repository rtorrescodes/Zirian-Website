"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- PRODUCT CATEGORIES ---

export async function getProductCategories() {
  return await prisma.productCategory.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function createProductCategory(data: { nombre: string, descripcion?: string }) {
  const result = await prisma.productCategory.create({
    data
  });
  revalidatePath("/admin/catalogo");
  return result;
}

// --- PRODUCTS ---

export async function getProducts() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { nombre: 'asc' }
  });
  
  return products.map(p => ({
    ...p,
    precio_base: p.precio_base ? Number(p.precio_base) : 0,
    costo_estimado: p.costo_estimado ? Number(p.costo_estimado) : null,
    stock_general: p.stock_general ? Number(p.stock_general) : 0,
  }));
}

export async function createProduct(data: {
  categoryId: number;
  nombre: string;
  codigo?: string;
  descripcion?: string;
  precio_base: number;
  costo_estimado?: number;
  unidad_medida: string;
  requiere_serie?: boolean;
}) {
  const result = await prisma.product.create({
    data
  });
  revalidatePath("/admin/catalogo");
  return {
    ...result,
    precio_base: result.precio_base ? Number(result.precio_base) : 0,
    costo_estimado: result.costo_estimado ? Number(result.costo_estimado) : null,
    stock_general: result.stock_general ? Number(result.stock_general) : 0,
  };
}

// --- SUPPLIERS ---

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function createSupplier(data: {
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}) {
  const result = await prisma.supplier.create({
    data
  });
  revalidatePath("/admin/catalogo");
  return result;
}
