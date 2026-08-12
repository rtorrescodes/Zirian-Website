'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSyscomSettings() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ['syscom_allowed_brands', 'syscom_allowed_models', 'syscom_category_map', 'syscom_featured_models']
      }
    }
  });

  const config = {
    brands: [] as string[],
    models: [] as string[],
    featuredModels: [] as string[],
    categoryMap: {} as Record<string, string>
  };

  for (const s of settings) {
    if (s.key === 'syscom_allowed_brands' && s.value) {
      config.brands = s.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    }
    if (s.key === 'syscom_allowed_models' && s.value) {
      config.models = s.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    }
    if (s.key === 'syscom_featured_models' && s.value) {
      config.featuredModels = s.value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    }
    if (s.key === 'syscom_category_map' && s.value) {
      try {
        config.categoryMap = JSON.parse(s.value);
      } catch (e) {
        config.categoryMap = {};
      }
    }
  }

  return config;
}

export async function updateSyscomSettings(brands: string[], models: string[], categoryMap: Record<string, string> = {}) {
  const brandsStr = brands.map(b => b.trim().toUpperCase()).filter(Boolean).join(',');
  const modelsStr = models.map(m => m.trim().toUpperCase()).filter(Boolean).join(',');
  const categoryMapStr = JSON.stringify(categoryMap);

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
  
  // Upsert category map
  await prisma.systemSetting.upsert({
    where: { key: 'syscom_category_map' },
    update: { value: categoryMapStr },
    create: { key: 'syscom_category_map', value: categoryMapStr, description: 'Mapeo de modelos excepcionales a categorias' }
  });

  revalidatePath('/admin/configuracion/syscom');
  revalidatePath('/admin/cotizador');
}

import { getSyscomProduct } from '@/lib/syscom';

export async function fetchSyscomProductAction(id: string) {
  try {
    const product = await getSyscomProduct(id);
    return product;
  } catch (error) {
    console.error("Error in fetchSyscomProductAction:", error);
    return null;
  }
}

export async function toggleSyscomFeatured(productId: string) {
  const config = await getSyscomSettings();
  let featured = [...config.featuredModels];
  
  const idStr = String(productId).toUpperCase();
  
  if (featured.includes(idStr)) {
    featured = featured.filter(x => x !== idStr);
  } else {
    featured.push(idStr);
    
    // Auto-allow it if it's not allowed yet
    if (!config.models.includes(idStr)) {
      const newModels = [...config.models, idStr];
      const modelsStr = newModels.join(',');
      await prisma.systemSetting.upsert({
        where: { key: 'syscom_allowed_models' },
        update: { value: modelsStr },
        create: { key: 'syscom_allowed_models', value: modelsStr, description: 'Modelos o SKUs permitidos de Syscom' }
      });
    }
  }
  
  const featuredStr = featured.join(',');
  await prisma.systemSetting.upsert({
    where: { key: 'syscom_featured_models' },
    update: { value: featuredStr },
    create: { key: 'syscom_featured_models', value: featuredStr, description: 'Modelos destacados en la tienda' }
  });

  revalidatePath('/admin/configuracion/syscom');
  revalidatePath('/[locale]/store', 'layout');
}
