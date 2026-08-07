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
  return await prisma.product.findMany({
    include: { category: true },
    orderBy: { nombre: 'asc' }
  });
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
  return result;
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
