'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  FileText,
  Paperclip,
  X,
  Check,
  Building2,
  Save,
  Eye,
  ShoppingCart,
  ChevronsUpDown,
  Zap,
} from 'lucide-react'

import { ClientSelector } from './client-selector';
import { ProductSearch } from './product-search';
import { QuoteCart } from './quote-cart';
import { QuoteSummary } from './quote-summary';
import { QuotePreview } from './quote-preview';

import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import { BaseQuotePdf } from '@/lib/pdf/BaseQuotePdf'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(m => m.PDFViewer), { ssr: false })
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { createQuote, updateQuote } from '@/app/actions/quotes'
import { searchSyscomForQuote } from '@/app/actions/syscom'

interface Category {
  id: number
  nombre: string
}

interface Client {
  id: number
  nombre: string
  telefono: string | null
  email: string | null
  status: string
  ubicacion?: string
}

interface Product {
  id: number
  nombre: string
  descripcion?: string | null
  codigo: string | null
  precio_base: any // Decimal from DB
  costo_estimado?: any
  unidad_medida: string
  categoryId: number
  category?: Category
  recommendations?: { recommended: Product }[]
}

export const currencyExact = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value)
}

export const IVA_RATE = 0.16

interface LineItem {
  product: Product
  qty: number
  detalles: string
}

interface Attachment {
  id: string
  name: string
  size: string
}

interface QuoteBuilderProps {
  initialClients: any[]
  initialProducts: any[]
  initialCategories: any[]
  initialClientId?: number
  initialQuote?: any
}

const clientTypeColor: Record<string, string> = {
  Lead: 'text-brand-cyan',
  Prospect: 'text-brand-green',
  Cliente: 'text-amber-300',
}

export function QuoteBuilder({
  initialClients,
  initialProducts,
  initialCategories,
  initialClientId,
  initialQuote,
}: QuoteBuilderProps) {
  const getInitialClient = () => {
    if (initialQuote?.clientId) return initialClients.find(c => c.id === initialQuote.clientId) || null
    if (initialClientId) return initialClients.find(c => c.id === initialClientId) || null
    return null
  }

  const [selectedClient, setSelectedClient] = useState<any | null>(getInitialClient())
  const [clientOpen, setClientOpen] = useState(false)
  const [clientQuery, setClientQuery] = useState('')

  const [activeCategory, setActiveCategory] = useState<number | null>(
    initialCategories.length > 0 ? initialCategories[0].id : null
  )
  const [productQuery, setProductQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'local' | 'syscom'>('local')
  const [syscomResults, setSyscomResults] = useState<{items: any[], filteredOut: number}>({ items: [], filteredOut: 0 })
  const [isSearchingSyscom, setIsSearchingSyscom] = useState(false)
  const [pickedProductId, setPickedProductId] = useState<number | string | null>(null)
  const [qty, setQty] = useState(1)
  const [itemDetails, setItemDetails] = useState('')

  const getInitialItems = () => {
    if (!initialQuote?.items) return []
    return initialQuote.items.map((i: any) => {
      // Si el ítem no tiene un producto en base de datos, creamos uno virtual temporal
      const itemProduct = i.product || {
        id: -Math.floor(Math.random() * 1000000), // ID negativo para identificar que es virtual
        nombre: i.descripcion || 'Artículo sin nombre',
        codigo: null,
        precio_base: i.precio_unitario || 0,
        unidad_medida: 'Pieza',
        categoryId: 0,
      }
      
      const details = i.product 
        ? i.descripcion.replace(i.product.nombre, '').trim()
        : ''

      return {
        product: itemProduct,
        qty: i.cantidad,
        detalles: details
      }
    })
  }

  const [items, setItems] = useState<LineItem[]>(getInitialItems())
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: 'a1', name: 'Catálogo_Cargadores_2026.pdf', size: '2.4 MB' },
  ])
  const fileRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(initialQuote?.id || null)
  const [mostrarDesglose, setMostrarDesglose] = useState(initialQuote?.mostrar_desglose ?? false)
  const [template, setTemplate] = useState<string>(initialQuote?.template || 'ev_charger')
  const [notasCliente, setNotasCliente] = useState(initialQuote?.notas_cliente || '')
  const [requiereFactura, setRequiereFactura] = useState<boolean>(initialQuote ? (initialQuote.requiere_factura || initialQuote.impuestos > 0) : true)
  const [status, setStatus] = useState<string>(initialQuote?.status || 'Borrador')
  const [motivoRechazo, setMotivoRechazo] = useState<string>(initialQuote?.motivo_rechazo || '')

  const resetBuilder = () => {
    setSaved(false)
    setSavedQuoteId(null)
    setItems([])
    setSelectedClient(null)
  }

  const filteredClients = useMemo(
    () =>
      initialClients.filter((c) =>
        `${c.nombre} ${c.status}`.toLowerCase().includes(clientQuery.toLowerCase()),
      ),
    [clientQuery, initialClients],
  )

  const filteredProducts = useMemo(
    () =>
      initialProducts.filter(
        (p) =>
          p.categoryId === activeCategory &&
          `${p.nombre} ${p.codigo ?? ''}`
            .toLowerCase()
            .includes(productQuery.toLowerCase()),
      ),
    [activeCategory, productQuery, initialProducts],
  )

  const pickedProduct = useMemo(() => {
    if (typeof pickedProductId === 'string' && pickedProductId.startsWith('syscom-')) {
      const sp = syscomResults.items && syscomResults.items.find(r => r.id === pickedProductId)
      if (!sp) return null
      return {
        id: -Math.floor(Math.random() * 100000),
        nombre: sp.nombre,
        descripcion: `Modelo: ${sp.modelo} | Marca: ${sp.marca}`,
        codigo: sp.modelo,
        precio_base: sp.precioListaMXN,
        costo_estimado: sp.precioEspecialMXN,
        unidad_medida: 'Pieza',
        categoryId: 0,
      } as Product
    }
    return initialProducts.find((p) => p.id === pickedProductId) ?? null
  }, [pickedProductId, initialProducts, syscomResults])

  const addItem = () => {
    if (!pickedProduct) return
    let finalProduct = { ...pickedProduct };
    let finalDetails = itemDetails;
    if (finalProduct.nombre.length > 100) {
      const cutoff = finalProduct.nombre.lastIndexOf(' ', 100);
      if (cutoff > 50) {
        const excess = finalProduct.nombre.substring(cutoff).trim();
        finalProduct.nombre = finalProduct.nombre.substring(0, cutoff) + '...';
        finalDetails = finalDetails ? `${finalDetails}\n\n${excess}` : excess;
      }
    }
    setItems((prev) => {
      return [...prev, { product: finalProduct, qty, detalles: finalDetails }]
    })
    setPickedProductId(null)
    setQty(1)
    setItemDetails('')
  }

  const addDirectItem = (product: Product, quantity = 1) => {
    let finalProduct = { ...product };
    let finalDetails = '';
    if (finalProduct.nombre.length > 100) {
      const cutoff = finalProduct.nombre.lastIndexOf(' ', 100);
      if (cutoff > 50) {
        const excess = finalProduct.nombre.substring(cutoff).trim();
        finalProduct.nombre = finalProduct.nombre.substring(0, cutoff) + '...';
        finalDetails = excess;
      }
    }
    setItems((prev) => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prev, { product: finalProduct, qty: quantity, detalles: finalDetails }]
    })
  }
  
  const finishAddItem = () => {
    setProductQuery('')
  }

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id))

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const next: Attachment[] = Array.from(files).map((f, idx) => ({
      id: `${Date.now()}-${idx}`,
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }))
    setAttachments((prev) => [...prev, ...next])
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.product.precio_base) * i.qty), 0)
  const subtotalCost = items.reduce((s, i) => s + (Number(i.product.costo_estimado || 0) * i.qty), 0)
  const ganancia = subtotal - subtotalCost
  const iva = requiereFactura ? subtotal * IVA_RATE : 0
  const total = subtotal + iva

  const handleSave = async () => {
    if (!selectedClient || items.length === 0) return
    setIsSaving(true);
    try {
      const payload = {
        clientId: selectedClient.id,
        subtotal: subtotal,
        impuestos: iva,
        total: total,
        mostrar_desglose: mostrarDesglose,
        template: template,
        requiere_factura: requiereFactura,
        status: status,
        motivo_rechazo: (status === 'Rechazada' || status === 'Cancelada') ? motivoRechazo : null,
        items: items.map(i => ({
          productId: i.product.id < 0 ? null : i.product.id,
          descripcion: i.product.nombre + (i.detalles ? "\n" + i.detalles : ""),
          cantidad: i.qty,
          precio_unitario: Number(i.product.precio_base),
          total: Number(i.product.precio_base) * i.qty
        }))
      }
      
      let quote;
      if (initialQuote?.id) {
        quote = await updateQuote(initialQuote.id, payload);
      } else {
        quote = await createQuote(payload);
      }
      
      setSaved(true)
      setSavedQuoteId(quote.id)
    } catch (error) {
      console.error("Error saving quote", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewPdf = async () => {
    if (!selectedClient || items.length === 0) return;
    
    setIsSaving(true);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<div style="font-family: sans-serif; padding: 2rem; text-align: center;">Guardando cambios y generando PDF actualizado...</div>');
    }
    
    try {
      const payload = {
        clientId: selectedClient.id,
        subtotal: subtotal,
        impuestos: iva,
        total: total,
        mostrar_desglose: mostrarDesglose,
        template: template,
        requiere_factura: requiereFactura,
        items: items.map(i => ({
          productId: i.product.id < 0 ? null : i.product.id,
          descripcion: i.product.nombre + (i.detalles ? "\n" + i.detalles : ""),
          cantidad: i.qty,
          precio_unitario: Number(i.product.precio_base),
          total: Number(i.product.precio_base) * i.qty
        }))
      }
      
      let quote;
      if (initialQuote?.id) {
        quote = await updateQuote(initialQuote.id, payload);
      } else {
        quote = await createQuote(payload);
      }
      
      setSaved(true);
      setSavedQuoteId(quote.id);
      
      if (newWindow) {
        newWindow.location.href = `/api/quotes/${quote.id}/pdf`;
      }
    } catch (error) {
      console.error("Error saving and viewing quote", error);
      if (newWindow) {
        newWindow.document.write('<div style="font-family: sans-serif; padding: 2rem; color: red;">Ocurrió un error al generar el PDF. Verifica tu conexión.</div>');
      }
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
      {/* ============ PANEL IZQUIERDO ============ */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Cliente */}
        <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <SectionTitle icon={Building2} step="1" label="Cliente" />
          <div className="relative mt-3">
            <ClientSelector 
              clients={initialClients}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
            />
          </div>
        </Card>
        
        {/* Productos */}
        <ProductSearch 
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          productQuery={productQuery}
          setProductQuery={setProductQuery}
          initialCategories={initialCategories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          initialProducts={initialProducts}
          isSearchingSyscom={isSearchingSyscom}
          syscomResults={syscomResults}
          pickedProductId={pickedProductId}
          setPickedProductId={setPickedProductId}
          addItem={addItem}
          addDirectItem={addDirectItem}
          itemDetails={itemDetails}
          setItemDetails={setItemDetails}
          finishAddItem={() => {
            setPickedProductId(null);
            setItemDetails('');
          }}
        />
      </div>

      {/* ============ PANEL DERECHO ============ */}
      <div className="flex h-[calc(100vh-140px)] flex-col rounded-2xl border border-brand-cyan/20 bg-slate-900/40 shadow-[0_0_40px_rgba(0,255,255,0.05)] backdrop-blur-sm overflow-hidden sticky top-24">
        {/* Cabecera Carrito */}
        <div className="flex items-center gap-2 border-b border-brand-cyan/20 bg-slate-950 p-4 md:px-6">
          <ShoppingCart className="h-5 w-5 text-brand-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
          <h2 className="font-tech text-base font-bold uppercase tracking-widest text-white">Carrito de Cotización</h2>
        </div>

        <QuoteCart 
          items={items}
          updateQty={updateQty}
          removeItem={removeItem}
          onFiles={(files) => {
            if (files) {
              const newFiles = Array.from(files).map((f) => ({
                id: Math.random().toString(36).substring(7),
                name: f.name,
                size: (f.size / 1024).toFixed(1) + ' KB',
              }));
              setAttachments((prev) => [...prev, ...newFiles]);
            }
          }}
          removeFile={(id) => setAttachments(prev => prev.filter(a => a.id !== id))}
          attachments={attachments}
          addDirectItem={addDirectItem}
        />

        <QuoteSummary 
          items={items}
          status={status}
          setStatus={setStatus}
          requiereFactura={requiereFactura}
          setRequiereFactura={setRequiereFactura}
          mostrarDesglose={mostrarDesglose}
          setMostrarDesglose={setMostrarDesglose}
          template={template}
          setTemplate={setTemplate}
          motivoRechazo={motivoRechazo}
          setMotivoRechazo={setMotivoRechazo}
          notasCliente={notasCliente}
          setNotasCliente={setNotasCliente}
          subtotal={subtotal}
          subtotalCost={subtotalCost}
          ganancia={ganancia}
          iva={iva}
          total={total}
          isSaving={isSaving}
          isSaved={saved}
          savedQuoteId={savedQuoteId}
          handleSave={handleSave}
          handleViewPdf={handleViewPdf}
          selectedClient={selectedClient}
        />
      </div>
      </div>
      
      <QuotePreview 
        template={template}
        selectedClient={selectedClient}
        items={items}
        requiereFactura={requiereFactura}
        notasCliente={notasCliente}
        mostrarDesglose={mostrarDesglose}
        subtotal={subtotal}
        iva={iva}
        total={total}
        moneda={initialQuote?.moneda}
        impuestosIniciales={initialQuote?.impuestos}
      />
    </>
  )
}

function SectionTitle({
  icon: Icon,
  step,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  step: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-blue/20 border border-brand-blue/30 text-xs font-tech font-bold text-brand-blue shadow-[0_0_10px_rgba(0,163,255,0.2)]">
        {step}
      </span>
      <Icon className="h-4 w-4 text-slate-400" />
      <h2 className="font-tech text-sm font-bold uppercase tracking-widest text-white">
        {label}
      </h2>
    </div>
  )
}
