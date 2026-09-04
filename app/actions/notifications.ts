"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

export async function getNotifications() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId = null;
  let isDistribuidor = false;

  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      userId = payload.id;
      if (payload.role === 'Distribuidor') {
        isDistribuidor = true;
      }
    } catch (e) {}
  }

  const whereClause: any = {};
  if (isDistribuidor) {
    whereClause.userId = userId;
  } else if (userId) {
    whereClause.OR = [
      { userId: null },
      { userId: userId }
    ];
  } else {
    // Si no está logueado, no regresar nada
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return notifications;
}

export async function markAsRead(id: number) {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId = null;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      userId = payload.id;
    } catch (e) {}
  }
  
  if (!userId) return;

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
  revalidatePath("/admin/dashboard");
}

export async function markAllAsRead() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zirian_session");
  let userId = null;
  let isDistribuidor = false;
  if (session) {
    try {
      const payload = await verifyAuth(session.value);
      userId = payload.id;
      if (payload.role === 'Distribuidor') isDistribuidor = true;
    } catch (e) {}
  }
  
  if (!userId) return;

  const whereClause: any = { isRead: false };
  if (isDistribuidor) {
    whereClause.userId = userId;
  } else {
    whereClause.OR = [
      { userId: null },
      { userId: userId }
    ];
  }

  await prisma.notification.updateMany({
    where: whereClause,
    data: { isRead: true }
  });
  revalidatePath("/admin/dashboard");
}

export async function createNotification(data: {
  title: string;
  message: string;
  categoria: string;
  url?: string;
  userId?: number;
}) {
  await prisma.notification.create({
    data
  });
  revalidatePath("/admin/dashboard");
}
