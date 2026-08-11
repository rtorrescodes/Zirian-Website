"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return notifications;
}

export async function markAsRead(id: number) {
  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });
  revalidatePath("/admin/dashboard");
}

export async function markAllAsRead() {
  await prisma.notification.updateMany({
    where: { isRead: false },
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
