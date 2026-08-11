import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const post = await prisma.post.findFirst({
    where: {
      title: {
        contains: 'panel solar'
      }
    }
  })

  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { featured_image: 'https://images.unsplash.com/photo-1509391366360-1e9e0481af1b?q=80&w=2000&auto=format&fit=crop' }
    })
    console.log(`Updated post: ${post.title}`)
  } else {
    console.log('Post not found!')
  }
}
main()
