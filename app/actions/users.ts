"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
      fecha_creacion: true,
      updatedAt: true,
    }
  });
}

export async function getUserById(id: number) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nombre: true,
      role: true,
      activo: true,
    }
  });
}

export async function createUser(data: {
  email: string;
  nombre: string;
  role: string;
  password?: string;
  activo: boolean;
}) {
  const { email, password, ...rest } = data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if exists
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) {
    throw new Error("El correo electrónico ya está registrado.");
  }

  let passwordHash = "";
  if (password) {
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash(password, salt);
  } else {
    // default password if none provided
    const salt = await bcrypt.genSalt(10);
    passwordHash = await bcrypt.hash("Zirian123!", salt);
  }

  const user = await prisma.user.create({
    data: {
      ...rest,
      email: normalizedEmail,
      passwordHash
    }
  });

  revalidatePath('/admin/configuracion/usuarios');
  return { id: user.id, email: user.email };
}

export async function updateUser(id: number, data: {
  email: string;
  nombre: string;
  role: string;
  password?: string;
  activo: boolean;
}) {
  const { email, password, ...rest } = data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if exists and is not this user
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists && exists.id !== id) {
    throw new Error("El correo electrónico ya está registrado en otra cuenta.");
  }

  const updateData: any = {
    ...rest,
    email: normalizedEmail
  };

  if (password && password.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(password, salt);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/admin/configuracion/usuarios');
  revalidatePath(`/admin/configuracion/usuarios/editor/${id}`);
  return { id: user.id, email: user.email };
}
