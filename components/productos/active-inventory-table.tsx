'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, Edit2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { ClickableRow } from '@/components/ui/clickable-row';

export default function ActiveInventoryTable({ products }: { products: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const categories = Array.from(new Set(products.map(p => p.category.nombre)));

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.marca && p.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.proveedor_default && p.proveedor_default.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'ALL' || p.category.nombre === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && p.activo) || (statusFilter === 'INACTIVE' && !p.activo);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-md backdrop-blur-sm mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, marca o proveedor..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-blue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex w-full sm:w-auto gap-4">
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-blue flex-1 sm:w-48"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Todas las Categorías</option>
            {categories.map((c: any) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-blue flex-1 sm:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Todos los Estatus</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl backdrop-blur-sm">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-slate-950/80 p-4 mb-4 border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <Package className="h-8 w-8 text-brand-blue drop-shadow-[0_0_8px_rgba(0,163,255,0.8)]" />
            </div>
            <h3 className="text-lg font-tech uppercase tracking-widest font-bold text-white">No hay resultados</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Intenta cambiar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-950/40 text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Producto / Servicio</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Marca / Prov.</th>
                  <th className="px-6 py-4 text-right">Precio Base</th>
                  <th className="px-6 py-4">Estatus</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => (
                  <ClickableRow key={product.id} href={`/admin/productos/editor/${product.id}`} className="hover:bg-slate-950/20 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded bg-slate-900 border border-slate-800">
                          <Package className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <p className="font-bold text-base text-white">{product.nombre}</p>
                          <div className="flex gap-2 items-center mt-1">
                            {product.codigo && <span className="text-xs font-mono text-slate-500">SKU: {product.codigo}</span>}
                            <span className="text-[11px] text-slate-400 font-tech tracking-wider uppercase bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">{product.unidad_medida}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300 font-medium">
                        {product.category.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300 font-bold">{product.marca || '-'}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{product.proveedor_default || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-brand-cyan text-base font-tech font-bold tracking-wider">
                          {formatCurrency(Number(product.precio_base))}
                        </span>
                        {product.costo_estimado && (
                          <>
                            <span className="text-[10px] text-slate-500 mt-1">
                              Costo: {formatCurrency(Number(product.costo_estimado))}
                            </span>
                            {(() => {
                              const p = Number(product.precio_base);
                              const c = Number(product.costo_estimado);
                              if (p > 0 && c > 0) {
                                const profit = p - c;
                                const margin = (profit / c) * 100;
                                return (
                                  <span className={`text-[11px] font-tech tracking-wider mt-0.5 font-bold ${profit < 0 ? 'text-red-500' : 'text-orange-400'}`}>
                                    {margin.toFixed(0)}% - {formatCurrency(profit)}
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </>
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
    </>
  );
}
