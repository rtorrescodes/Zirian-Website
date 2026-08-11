'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStripeEnvironment() {
  const result: any[] = await prisma.$queryRaw`SELECT value FROM "SystemSetting" WHERE key = 'stripe_environment' LIMIT 1`;
  return result[0]?.value || 'live';
}

export async function setStripeEnvironment(environment: 'live' | 'test', adminEmail: string) {
  // Check if exists
  const existing: any[] = await prisma.$queryRaw`SELECT id FROM "SystemSetting" WHERE key = 'stripe_environment'`;
  
  if (existing.length > 0) {
    await prisma.$executeRaw`UPDATE "SystemSetting" SET value = ${environment}, "updatedBy" = ${adminEmail}, "updatedAt" = NOW() WHERE key = 'stripe_environment'`;
  } else {
    await prisma.$executeRaw`INSERT INTO "SystemSetting" (key, value, description, "updatedBy", "updatedAt") VALUES ('stripe_environment', ${environment}, 'Stripe payment environment (test/live)', ${adminEmail}, NOW())`;
  }

  revalidatePath('/admin/ajustes');
  revalidatePath('/[locale]/store/cart', 'page');
  return { success: true };
}
