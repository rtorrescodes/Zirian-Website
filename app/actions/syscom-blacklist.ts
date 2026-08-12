'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSyscomBlacklist(): Promise<string[]> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'syscom_blacklist' }
  });

  if (!setting || !setting.value) return [];
  return setting.value.split(',').map(x => x.trim()).filter(Boolean);
}

export async function addToSyscomBlacklist(productId: string) {
  const currentList = await getSyscomBlacklist();
  
  if (!currentList.includes(productId)) {
    currentList.push(productId);
    const newValue = currentList.join(',');
    
    await prisma.systemSetting.upsert({
      where: { key: 'syscom_blacklist' },
      update: { value: newValue },
      create: { key: 'syscom_blacklist', value: newValue, description: 'Productos ocultos de la tienda Syscom' }
    });
  }

  revalidatePath('/admin/configuracion/syscom');
  revalidatePath('/[locale]/store', 'layout');
}

export async function removeFromSyscomBlacklist(productId: string) {
  const currentList = await getSyscomBlacklist();
  const newList = currentList.filter(id => id !== productId);
  const newValue = newList.join(',');
  
  await prisma.systemSetting.upsert({
    where: { key: 'syscom_blacklist' },
    update: { value: newValue },
    create: { key: 'syscom_blacklist', value: newValue, description: 'Productos ocultos de la tienda Syscom' }
  });

  revalidatePath('/admin/configuracion/syscom');
  revalidatePath('/[locale]/store', 'layout');
}
