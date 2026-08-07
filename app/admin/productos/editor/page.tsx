import { AppShell } from '@/components/panel/app-shell';
import { ProductEditor } from '@/components/productos/product-editor';
import { getCategories } from '@/app/actions/products';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <AppShell title="Nuevo Producto / Servicio" subtitle="Agrega un nuevo elemento al catálogo.">
      <ProductEditor categories={categories} />
    </AppShell>
  );
}
