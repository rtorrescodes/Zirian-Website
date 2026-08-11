import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { fecha_creacion: 'desc' },
    take: 5
  });
  console.log("TICKETS:");
  console.log(JSON.stringify(tickets, null, 2));

  const totalLeads = await prisma.client.count();
  console.log("TOTAL LEADS:", totalLeads);

  const alexLeads = await prisma.client.findMany({
    where: { nombre: { contains: 'Alejandro', mode: 'insensitive' } }
  });
  console.log("ALEX LEADS:", JSON.stringify(alexLeads, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
