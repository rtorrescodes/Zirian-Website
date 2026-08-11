import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { featured_image: null },
        { featured_image: '' }
      ]
    },
    select: { id: true, title: true }
  })
  
  console.log(JSON.stringify(posts, null, 2))
}
main()
