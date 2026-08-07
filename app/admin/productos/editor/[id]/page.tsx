import { AppShell } from '@/components/panel/app-shell';
import { ProductEditor } from '@/components/productos/product-editor';
import { getProductById, getCategories } from '@/app/actions/products';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return notFound();

  const product = await getProductById(id);
  if (!product) return notFound();

  const categories = await getCategories();

  return (
    <AppShell title={`Editar Producto: ${product.nombre}`} subtitle="Modifica los detalles del producto en el catálogo.">
      <ProductEditor categories={categories} initialData={product} />
    </AppShell>
  );
}
