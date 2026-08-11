'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { createProduct, updateProduct, createCategory } from '@/app/actions/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Search } from 'lucide-react';

interface ProductEditorProps {
  initialData?: any;
  categories: any[];
  allProducts?: any[];
}

export function ProductEditor({ initialData, categories: initialCategories, allProducts = [] }: ProductEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState(initialCategories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>(
    initialData?.recommendations?.map((r: any) => r.recommended) || []
  );
  const [searchRec, setSearchRec] = useState('');
  const [showRecDropdown, setShowRecDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    codigo: initialData?.codigo || '',
    marca: initialData?.marca || '',
    proveedor_default: initialData?.proveedor_default || '',
    descripcion: initialData?.descripcion || '',
    precio_base: initialData?.precio_base || '',
    costo_estimado: initialData?.costo_estimado || '',
    unidad_medida: initialData?.unidad_medida || 'Pieza',
    activo: initialData?.activo !== undefined ? initialData.activo : true,
    categoryId: initialData?.categoryId?.toString() || '',
    notas: initialData?.notas || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const cat = await createCategory({ nombre: newCategoryName });
      setCategories([...categories, cat]);
      setFormData(prev => ({ ...prev, categoryId: cat.id.toString() }));
      setShowNewCategory(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error creating category', error);
      alert('Error al crear categoría');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const dataToSubmit = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        precio_base: parseFloat(formData.precio_base),
        costo_estimado: formData.costo_estimado ? parseFloat(formData.costo_estimado) : undefined,
      };

      if (initialData?.id) {
        await updateProduct(initialData.id, dataToSubmit);
      } else {
        await createProduct(dataToSubmit);
      }
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Hubo un error al guardar. Revisa la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/productos">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">
            {initialData ? 'Editar Producto' : 'Crear Producto'}
          </h1>
          <p className="text-sm font-tech text-slate-400">Administra los detalles para el catálogo y cotizador.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Izquierda - Datos Principales */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Información General</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Categoría *</label>
                <div className="flex gap-2">
                  <Select name="categoryId" value={formData.categoryId} onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v }))} required>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecciona una categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Selecciona una categoría...</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={() => setShowNewCategory(!showNewCategory)} className="border-slate-700 bg-slate-950/80 hover:bg-slate-800">
                    <Plus className="h-4 w-4 text-brand-blue" />
                  </Button>
                </div>
                
                {showNewCategory && (
                  <div className="flex gap-2 mt-2 p-3 bg-slate-950 rounded-lg border border-brand-blue/30">
                    <Input 
                      placeholder="Nueva categoría" 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                    />
                    <Button type="button" onClick={handleCreateCategory} className="h-8 bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan text-xs font-bold uppercase">
                      Crear
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Nombre del Producto / Servicio *</label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} required className="" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Código / SKU</label>
                  <Input name="codigo" value={formData.codigo} onChange={handleChange} placeholder="Opcional" className="" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Unidad de Medida</label>
                  <Select name="unidad_medida" value={formData.unidad_medida} onValueChange={(v) => setFormData(p => ({ ...p, unidad_medida: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pieza (PZA)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pieza">Pieza (PZA)</SelectItem>
                      <SelectItem value="Servicio">Servicio (SRV)</SelectItem>
                      <SelectItem value="Metro">Metro (M)</SelectItem>
                      <SelectItem value="Hora">Hora (HR)</SelectItem>
                      <SelectItem value="Kit">Kit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Marca</label>
                  <Input name="marca" value={formData.marca} onChange={handleChange} placeholder="Ej. Syscom, Hikvision..." className="" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Proveedor</label>
                  <Input name="proveedor_default" value={formData.proveedor_default} onChange={handleChange} placeholder="Ej. Zirian, Syscom..." className="" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Descripción Breve</label>
                <Textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Detalles visibles en la cotización..." className=" min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Notas Internas</label>
                <Textarea name="notas" value={formData.notas} onChange={handleChange} placeholder="Referencias, URLs, notas técnicas para uso interno..." className=" min-h-[100px]" />
                <p className="text-[10px] text-slate-500">Estas notas no serán visibles para el cliente.</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha - Precios y Estatus */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Precios y Costos</h3>
              
              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Precio Base (Venta) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <Input type="number" step="0.01" name="precio_base" value={formData.precio_base} onChange={handleChange} required className="pl-8 bg-slate-950/80 border-slate-700 text-brand-cyan font-tech text-lg focus-visible:ring-brand-blue" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">Costo Estimado (Interno)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <Input type="number" step="0.01" name="costo_estimado" value={formData.costo_estimado} onChange={handleChange} placeholder="0.00" className="pl-8 bg-slate-950/80 border-slate-700 text-slate-300 focus-visible:ring-brand-blue" />
                </div>
                <p className="text-[10px] text-slate-500">Útil para calcular márgenes de ganancia.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm">
              <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Visibilidad</h3>
              
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="activo" 
                  name="activo" 
                  checked={formData.activo} 
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-brand-blue focus:ring-brand-blue focus:ring-offset-slate-900" 
                />
                <label htmlFor="activo" className="text-sm font-medium text-white">
                  Producto Activo
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Si está inactivo, no aparecerá en el cotizador.</p>
                </label>
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full bg-brand-blue hover:bg-brand-blue/80 text-slate-950 hover:bg-brand-cyan h-12 font-tech font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,163,255,0.4)] transition-all">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>

            {initialData && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl backdrop-blur-sm mt-6">
                <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-3">Accesorios Recomendados</h3>
                <p className="text-xs text-slate-400">Selecciona productos que se sugerirán automáticamente cuando se agregue este producto a una cotización.</p>
                
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      placeholder="Buscar producto..." 
                      value={searchRec}
                      onChange={(e) => {
                        setSearchRec(e.target.value);
                        setShowRecDropdown(true);
                      }}
                      onFocus={() => setShowRecDropdown(true)}
                      className="pl-9 bg-slate-950 border-slate-700 text-white focus-visible:ring-brand-blue"
                    />
                  </div>
                  
                  {showRecDropdown && searchRec && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {allProducts.filter(p => 
                        p.id !== initialData.id &&
                        !recommendations.some(r => r.id === p.id) &&
                        p.nombre.toLowerCase().includes(searchRec.toLowerCase())
                      ).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={async () => {
                            try {
                              const { addRecommendation } = await import('@/app/actions/products');
                              await addRecommendation(initialData.id, p.id);
                              setRecommendations([...recommendations, p]);
                              setSearchRec('');
                              setShowRecDropdown(false);
                            } catch (e) {
                              alert('Error al agregar recomendación');
                            }
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white border-b border-slate-800 last:border-0"
                        >
                          {p.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-xs text-slate-300 truncate pr-2">{rec.nombre}</span>
                      <button 
                        type="button"
                        onClick={async () => {
                          try {
                            const { removeRecommendation } = await import('@/app/actions/products');
                            await removeRecommendation(initialData.id, rec.id);
                            setRecommendations(recommendations.filter(r => r.id !== rec.id));
                          } catch (e) {
                            alert('Error al quitar');
                          }
                        }}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <div className="text-center text-slate-500 text-xs py-2 italic">Sin recomendaciones</div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </form>
    </div>
  );
}
