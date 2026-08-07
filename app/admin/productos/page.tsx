import { getProducts } from '@/app/actions/products';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Package, Edit2, Archive, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { AppShell } from '@/components/panel/app-shell';
import { ClickableRow } from '@/components/ui/clickable-row';

export const dynamic = 'force-dynamic';

export default async function ProductosAdminPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q || '';

  const products = await getProducts(query);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <AppShell title="Catálogo de Productos" subtitle="Gestiona los productos, servicios e insumos para el cotizador.">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-tech text-xl font-bold uppercase tracking-widest text-white">Inventario Activo</h2>
            <p className="font-tech text-sm text-slate-400">{products.length} productos registrados</p>
          </div>
          <Link href="/admin/productos/editor">
            <Button className="bg-brand-blue hover:bg-brand-blue/80 text-white font-tech uppercase tracking-wider font-bold shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </Link>
        </div>

        {/* Filtros simples por ahora */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm">
          <p className="text-sm text-slate-400 font-tech uppercase tracking-widest">Filtros de búsqueda próximamente...</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-950/80 p-4 mb-4 border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <Package className="h-8 w-8 text-brand-blue drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
              </div>
              <h3 className="text-lg font-tech uppercase tracking-widest font-bold text-white">El catálogo está vacío</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-sm">
                Agrega tu primer producto, servicio o insumo para poder utilizarlo en el cotizador.
              </p>
              <Link href="/admin/productos/editor" className="mt-6">
                <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-tech uppercase tracking-wider">Crear Producto</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Producto / Servicio</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4 text-right">Precio Base</th>
                    <th className="px-6 py-4">Estatus</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((product) => (
                    <ClickableRow key={product.id} href={`/admin/productos/editor/${product.id}`} className="hover:bg-slate-950/20 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-1.5 rounded bg-slate-900 border border-slate-800">
                            <Package className="h-4 w-4 text-brand-blue" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{product.nombre}</p>
                            <div className="flex gap-2 items-center mt-1">
                              {product.codigo && <span className="text-[10px] font-mono text-slate-500">SKU: {product.codigo}</span>}
                              <span className="text-[10px] text-slate-400 font-tech tracking-wider uppercase bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">{product.unidad_medida}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-300 font-medium">
                          {product.category.nombre}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-brand-cyan font-tech font-bold tracking-wider">
                            {formatCurrency(Number(product.precio_base))}
                          </span>
                          {product.costo_estimado && (
                            <span className="text-[10px] text-slate-500">
                              Costo: {formatCurrency(Number(product.costo_estimado))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.activo ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-brand-green/10 text-brand-green border border-brand-green/30 px-2 py-1 text-[10px] font-bold font-tech uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/50 text-slate-400 border border-slate-700 px-2 py-1 text-[10px] font-bold font-tech uppercase tracking-wider">
                            <XCircle className="h-3 w-3" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/productos/editor/${product.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </ClickableRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
