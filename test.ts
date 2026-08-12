import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.systemSetting.findMany({where: {key: {in: ['syscom_allowed_brands', 'syscom_allowed_models']}}}).then(console.log);
