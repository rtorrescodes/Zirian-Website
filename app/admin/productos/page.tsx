import { getProducts } from '@/app/actions/products';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import ActiveInventoryTable from '@/components/productos/active-inventory-table';

export const dynamic = 'force-dynamic';

export default async function ProductosAdminPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';

  const products = await getProducts(query);

  return (
    <AppShell title="Catálogo de Productos" subtitle="Gestiona los productos, servicios e insumos para el cotizador.">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-tech text-xl font-bold uppercase tracking-widest text-white">Inventario Activo</h2>
            <p className="font-tech text-sm text-slate-400">{products.length} productos registrados</p>
          </div>
          <Link href="/admin/productos/editor">
            <Button className="bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan font-tech uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>

        <ActiveInventoryTable products={products} />
      </div>
    </AppShell>
  );
}
