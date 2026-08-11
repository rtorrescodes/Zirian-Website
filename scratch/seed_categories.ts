import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany()
  for (const post of posts) {
    let cat = 'Noticias'
    if (post.title.includes('Cargador') || post.title.includes('Carga') || post.title.includes('Auto')) {
      cat = 'Cargadores EV'
    } else if (post.title.includes('Solar') || post.title.includes('Baterías')) {
      cat = 'Energía Solar'
    } else if (post.title.includes('Domótica') || post.title.includes('RTI')) {
      cat = 'Domótica'
    }
    
    // In our schema we added category field
    // Just cast it as any to avoid type errors since we couldn't run prisma generate due to EPERM
    await (prisma.post as any).update({
      where: { id: post.id },
      data: { category: cat }
    })
  }
  console.log("Categories seeded.")
}
main()
