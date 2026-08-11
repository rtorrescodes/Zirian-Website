import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const posts = await prisma.post.findMany()

  for (const post of posts) {
    if (post.title.includes('Carga Inteligente')) {
      await prisma.post.update({ where: { id: post.id }, data: { featured_image: '/assets/images/ev_charger_luxury.jpg' } })
    } else if (post.title.includes('Tu Cargador EV')) {
      await prisma.post.update({ where: { id: post.id }, data: { featured_image: '/assets/images/hero_ev_charger.jpg' } })
    } else if (post.title.includes('Baterías Blade')) {
      await prisma.post.update({ where: { id: post.id }, data: { featured_image: '/assets/images/solar_panels_batteries.jpg' } })
    } else if (post.title.includes('Domótica Marina')) {
      await prisma.post.update({ where: { id: post.id }, data: { featured_image: '/assets/images/smart_home_luxury.jpg' } })
    } else if (post.title.includes('panel solar')) {
      await prisma.post.update({ where: { id: post.id }, data: { featured_image: '/assets/images/solar_panels_batteries.jpg' } })
    }
  }

  console.log("Images updated with LOCAL assets.");
}
main()
