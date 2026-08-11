'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSyscomSettings() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ['syscom_allowed_brands', 'syscom_allowed_models']
      }
    }
  });

  const config = {
    brands: [] as string[],
    models: [] as string[]
  };

  for (const s of settings) {
    if (s.key === 'syscom_allowed_brands' && s.value) {
      config.brands = s.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    }
    if (s.key === 'syscom_allowed_models' && s.value) {
      config.models = s.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    }
  }

  return config;
}

export async function updateSyscomSettings(brands: string[], models: string[]) {
  const brandsStr = brands.map(b => b.trim().toUpperCase()).filter(Boolean).join(',');
  const modelsStr = models.map(m => m.trim().toUpperCase()).filter(Boolean).join(',');

  // Upsert brands
  await prisma.systemSetting.upsert({
    where: { key: 'syscom_allowed_brands' },
    update: { value: brandsStr },
    create: { key: 'syscom_allowed_brands', value: brandsStr, description: 'Marcas permitidas de Syscom' }
  });

  // Upsert models
  await prisma.systemSetting.upsert({
    where: { key: 'syscom_allowed_models' },
    update: { value: modelsStr },
    create: { key: 'syscom_allowed_models', value: modelsStr, description: 'Modelos o SKUs permitidos de Syscom' }
  });

  revalidatePath('/admin/configuracion/syscom');
  revalidatePath('/admin/cotizador');
}
