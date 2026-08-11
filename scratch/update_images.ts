import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2
  })

  // Update RTI post
  await prisma.post.update({
    where: { id: posts[0].id },
    data: { featured_image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=2000&auto=format&fit=crop' }
  })

  // Update Solar post
  await prisma.post.update({
    where: { id: posts[1].id },
    data: { featured_image: 'https://images.unsplash.com/photo-1509391366360-1e9e0481af1b?q=80&w=2000&auto=format&fit=crop' }
  })

  console.log("Images updated successfully using Unsplash placeholders.");
}
main()
