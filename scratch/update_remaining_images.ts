import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { featured_image: null },
        { featured_image: '' }
      ]
    }
  })

  for (const post of posts) {
    if (post.title.includes('Carga Inteligente')) {
      await prisma.post.update({
        where: { id: post.id },
        data: { featured_image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938cb?q=80&w=2000&auto=format&fit=crop' }
      })
    } else if (post.title.includes('Baterías Blade')) {
      await prisma.post.update({
        where: { id: post.id },
        data: { featured_image: 'https://images.unsplash.com/photo-1678881255554-411a03da13f9?q=80&w=2000&auto=format&fit=crop' }
      })
    }
  }

  console.log("Images updated for remaining articles.");
}
main()
