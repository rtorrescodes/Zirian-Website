import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true, featured_image: true }
  })
  console.log(JSON.stringify(posts, null, 2))
}
main()
