'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSyscomSettings() {
  const config = {
    brands: [] as string[],
    models: [] as string[],
    featuredModels: [] as string[],
    categoryMap: {} as Record<string, string>
  };

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['syscom_allowed_brands', 'syscom_allowed_models', 'syscom_category_map', 'syscom_featured_models']
        }
      }
    });

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
  } catch (error) {
    console.error('getSyscomSettings fallback on connection glitch:', error);
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

export async function checkSyscomHealthAction(shouldRevalidate = false) {
  const { getSyscomToken, getSyscomExchangeRate } = await import('@/lib/syscom');
  const timestamp = new Date().toISOString();
  try {
    const token = await getSyscomToken();
    if (!token) {
      const err = "No se pudo obtener el token de Syscom. Verifica SYSCOM_CLIENT_ID y SYSCOM_CLIENT_SECRET.";
      await prisma.systemSetting.upsert({
        where: { key: 'syscom_last_status' },
        update: { value: `Error: ${err}` },
        create: { key: 'syscom_last_status', value: `Error: ${err}`, description: 'Último estado de conexión Syscom' }
      });
      await prisma.systemSetting.upsert({
        where: { key: 'syscom_last_check_time' },
        update: { value: timestamp },
        create: { key: 'syscom_last_check_time', value: timestamp, description: 'Fecha y hora de última prueba Syscom' }
      });
      if (shouldRevalidate) {
        try { revalidatePath('/admin/configuracion/syscom'); } catch (e) {}
      }
      return { success: false, status: 'Error', error: err, lastCheck: timestamp, exchangeRate: 20.0 };
    }

    const tc = await getSyscomExchangeRate();
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_last_status' },
      update: { value: 'OK' },
      create: { key: 'syscom_last_status', value: 'OK', description: 'Último estado de conexión Syscom' }
    });
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_last_check_time' },
      update: { value: timestamp },
      create: { key: 'syscom_last_check_time', value: timestamp, description: 'Fecha y hora de última prueba Syscom' }
    });
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_last_tc' },
      update: { value: tc.toString() },
      create: { key: 'syscom_last_tc', value: tc.toString(), description: 'Tipo de cambio Syscom verificado' }
    });

    if (shouldRevalidate) {
      try { revalidatePath('/admin/configuracion/syscom'); } catch (e) {}
    }
    return { success: true, status: 'OK', lastCheck: timestamp, exchangeRate: tc };
  } catch (error: any) {
    const err = error?.message || 'Fallo desconocido al conectar con Syscom';
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_last_status' },
      update: { value: `Error: ${err}` },
      create: { key: 'syscom_last_status', value: `Error: ${err}`, description: 'Último estado de conexión Syscom' }
    });
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_last_check_time' },
      update: { value: timestamp },
      create: { key: 'syscom_last_check_time', value: timestamp, description: 'Fecha y hora de última prueba Syscom' }
    });
    if (shouldRevalidate) {
      try { revalidatePath('/admin/configuracion/syscom'); } catch (e) {}
    }
    return { success: false, status: 'Error', error: err, lastCheck: timestamp, exchangeRate: 20.0 };
  }
}

export async function getSyscomHealthStatus() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['syscom_last_check_time', 'syscom_last_status', 'syscom_last_tc']
        }
      }
    });

    const statusMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!statusMap.syscom_last_check_time) {
      return await checkSyscomHealthAction();
    }

    return {
      success: statusMap.syscom_last_status === 'OK',
      status: statusMap.syscom_last_status || 'Desconocido',
      error: statusMap.syscom_last_status !== 'OK' ? statusMap.syscom_last_status : undefined,
      lastCheck: statusMap.syscom_last_check_time,
      exchangeRate: statusMap.syscom_last_tc ? parseFloat(statusMap.syscom_last_tc) : 20.0
    };
  } catch (error) {
    return {
      success: false,
      status: 'Error al consultar estado',
      error: String(error),
      lastCheck: new Date().toISOString(),
      exchangeRate: 20.0
    };
  }
}
