import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany()
  for (const post of posts) {
    if (post.title.includes('Baterías Blade')) {
      await prisma.post.update({
        where: { id: post.id },
        data: { featured_image: '/assets/images/ev_b2b_engineering.jpg' }
      })
    }
  }
  console.log("BYD image updated.")
}
main()
