import { AppShell } from '@/components/panel/app-shell'
import { QuoteBuilder } from '@/components/cotizador/quote-builder'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic";

export default async function CotizadorPage({ searchParams }: { searchParams: { clientId?: string } }) {
  // Fetch real data from the database
  const clients = await prisma.client.findMany({
    orderBy: { nombre: 'asc' }
  })

  const products = await prisma.product.findMany({
    include: { category: true },
    where: { activo: true },
    orderBy: { nombre: 'asc' }
  })

  const categories = await prisma.productCategory.findMany({
    orderBy: { nombre: 'asc' }
  })

  return (
    <AppShell
      title="Cotizador"
      subtitle="Instalación de cargadores EV · genera y guarda cotizaciones"
    >
      <QuoteBuilder 
        initialClients={clients} 
        initialProducts={products} 
        initialCategories={categories} 
        initialClientId={searchParams.clientId ? parseInt(searchParams.clientId, 10) : undefined}
      />
    </AppShell>
  )
}
