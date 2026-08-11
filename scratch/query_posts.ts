import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2
  })
  console.log(JSON.stringify(posts.map(p => ({ title: p.title, excerpt: p.excerpt })), null, 2))
}
main()
