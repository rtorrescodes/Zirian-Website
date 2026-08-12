import { prisma } from '../lib/prisma';

async function main() {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'syscom_allowed_models' }
  });
  console.log("Current models:", setting?.value);
  
  if (setting && setting.value) {
    const list = setting.value.split(',').map(x => x.trim()).filter(Boolean);
    const cleaned = list.map(item => {
      // Find a 5-6 digit sequence (syscom ID) inside the string
      const match = item.match(/(\d{5,8})/);
      if (match) {
        return match[1];
      }
      return item;
    });
    
    // De-duplicate
    const uniqueCleaned = Array.from(new Set(cleaned));
    
    await prisma.systemSetting.update({
      where: { key: 'syscom_allowed_models' },
      data: { value: uniqueCleaned.join(',') }
    });
    console.log("Cleaned models:", uniqueCleaned);
  }
}

main().catch(console.error);
