import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany()
  for (const post of posts) {
    if (post.title.includes('Baterías Blade')) {
      await prisma.post.update({
        where: { id: post.id },
        data: { featured_image: 'https://images.unsplash.com/photo-1620800615462-8418f4ba6d57?q=80&w=2000&auto=format&fit=crop' }
      })
    }
  }
  console.log("BYD image updated to real battery photo.")
}
main()
