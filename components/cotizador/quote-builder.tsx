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
  codigo: string | null
  precio_base: any // Decimal from DB
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
  const [pickedProductId, setPickedProductId] = useState<number | null>(null)
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
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(initialQuote?.id || null)
  const [mostrarDesglose, setMostrarDesglose] = useState(initialQuote?.mostrar_desglose ?? false)
  const [template, setTemplate] = useState<string>(initialQuote?.template || 'ev_charger')
  const [requiereFactura, setRequiereFactura] = useState<boolean>(initialQuote ? (initialQuote.requiere_factura || initialQuote.impuestos > 0) : true)

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

  const pickedProduct = initialProducts.find((p) => p.id === pickedProductId) ?? null

  const addItem = () => {
    if (!pickedProduct) return
    setItems((prev) => {
      return [...prev, { product: pickedProduct, qty, detalles: itemDetails }]
    })
    setPickedProductId(null)
    setQty(1)
    setItemDetails('')
  }

  const addDirectItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      // Si ya existe, solo suma la cantidad
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + quantity } : i);
      }
      return [...prev, { product, qty: quantity, detalles: '' }]
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
  const iva = requiereFactura ? subtotal * IVA_RATE : 0
  const total = subtotal + iva

  const handleSave = async () => {
    if (!selectedClient || items.length === 0) return
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
      
      setSaved(true)
      setSavedQuoteId(quote.id)
    } catch (error) {
      console.error("Error saving quote", error)
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
            <button
              type="button"
              onClick={() => setClientOpen((o) => !o)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-left text-sm text-white transition-colors hover:border-brand-blue"
            >
              {selectedClient ? (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-cyan/15 text-xs font-semibold text-brand-cyan">
                    {selectedClient.nombre.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {selectedClient.nombre}
                    </span>
                    <span className={cn('block text-xs', clientTypeColor[selectedClient.status] || 'text-muted-foreground')}>
                      {selectedClient.status}
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex-1 text-muted-foreground">Selecciona o busca un cliente…</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            {clientOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                <div className="relative border-b border-slate-800 p-2 bg-slate-950/50">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    autoFocus
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Buscar cliente por nombre..."
                    className="h-9 border-0 bg-transparent pl-8 text-white focus-visible:ring-0 placeholder:text-slate-500"
                  />
                </div>
                
                <ul className="max-h-60 overflow-y-auto p-1 bg-slate-900">
                  {filteredClients.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          setSelectedClient(c)
                          setClientOpen(false)
                          setClientQuery('')
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-foreground">
                          {c.nombre.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-white">
                            {c.nombre}
                          </span>
                          <span className="block truncate text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                            {c.status}
                          </span>
                        </span>
                        {selectedClient?.id === c.id && (
                          <Check className="h-4 w-4 text-brand-green" />
                        )}
                      </button>
                    </li>
                  ))}
                  {filteredClients.length === 0 && (
                    <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                      Sin resultados
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>

        {/* Categoría + producto */}
        <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <SectionTitle icon={ShoppingCart} step="2" label="Agregar productos" />

          <Label className="mt-4 block text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
            Categoría
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id)
                  setPickedProductId(null)
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-tech font-bold uppercase tracking-wider transition-colors',
                  activeCategory === cat.id
                    ? 'border-brand-blue/50 bg-brand-blue/20 text-brand-blue shadow-[0_0_10px_rgba(0,163,255,0.3)]'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white',
                )}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <Label className="mt-4 block text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
            Producto
          </Label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value)
                setPickedProductId(null)
              }}
              placeholder={`Buscar en ${activeCategory}…`}
              className="pl-9"
            />
          </div>

          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setPickedProductId(p.id)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    pickedProductId === p.id
                      ? 'border-brand-blue/50 bg-brand-blue/10 shadow-[inset_0_0_15px_rgba(0,163,255,0.15)]'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900',
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-900 text-slate-500 border border-slate-800">
                    <Zap className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">
                      {p.nombre}
                    </span>
                    <span className="block truncate text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                      {p.codigo ?? p.category?.nombre}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-emerald-400">
                      {currencyExact(Number(p.precio_base))}
                    </span>
                    <span className="block text-[10px] font-tech font-bold uppercase tracking-wider text-slate-500">/{p.unidad_medida}</span>
                  </span>
                </button>
              </li>
            ))}
            {filteredProducts.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin productos en esta búsqueda
              </li>
            )}
          </ul>

          {/* Detalles */}
          <div className="mt-4">
            <Label className="text-xs text-slate-400 uppercase tracking-wider font-tech mb-1 block">Descripción Técnica del Concepto</Label>
            <Textarea
              value={itemDetails}
              onChange={(e) => setItemDetails(e.target.value)}
              placeholder="Ej. 25 Mts de cable 100% cobre, ductería..."
              className="resize-none h-16 border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-600 focus-visible:ring-brand-blue"
            />
          </div>

          {/* Cantidad + agregar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/80 p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4 text-slate-400 hover:text-white" />
              </Button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 bg-transparent text-center text-sm font-semibold text-white outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Cantidad"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-800"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4 text-slate-400 hover:text-white" />
              </Button>
            </div>
            
            <Button
              type="button"
              onClick={addItem}
              disabled={!pickedProduct}
              className="flex-1 bg-brand-blue text-slate-950 hover:bg-brand-cyan font-tech font-bold uppercase tracking-widest hover:bg-brand-blue/80 disabled:opacity-40 shadow-[0_0_15px_rgba(0,163,255,0.3)] transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar a la cotización
            </Button>
          </div>
        </Card>

        {/* Adjuntos */}
        <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <SectionTitle icon={Paperclip} step="3" label="Catálogos y guías (PDF)" />
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full border-dashed border-slate-700 bg-slate-950/40 text-slate-400 hover:border-brand-blue hover:text-white hover:bg-brand-blue/10 font-tech font-bold uppercase tracking-widest transition-colors"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Adjuntar catálogo PDF
          </Button>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <span
                  key={a.id}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 py-1 pl-3 pr-1.5 text-xs text-white"
                >
                  <FileText className="h-3.5 w-3.5 text-brand-blue" />
                  <span className="max-w-[160px] truncate font-medium">
                    {a.name}
                  </span>
                  <span className="text-muted-foreground">{a.size}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((x) => x.id !== a.id))
                    }
                    className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
                    aria-label={`Quitar ${a.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              </div>
            )}
          </Card>
        </div>

      {/* ============ PANEL DERECHO — RECIBO ============ */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md">
          {/* Encabezado del recibo */}
          <div className="relative border-b border-slate-800 bg-slate-950/60 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-tech text-lg font-bold uppercase tracking-widest text-white">
                  Cotización
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-brand-blue tracking-wider">
                  COT-{new Date().getFullYear()}-{String(items.length + 1043).padStart(4, '0')}
                </p>
              </div>
              <Badge variant="outline" className="border-brand-blue/30 bg-brand-blue/10 text-brand-blue font-tech font-bold uppercase tracking-wider">
                Borrador
              </Badge>
            </div>
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-500">
                Cliente
              </p>
              <p className="mt-1 text-sm font-medium text-white">
                {selectedClient ? selectedClient.nombre : 'Sin asignar'}
              </p>
              {selectedClient && (
                <p className="text-xs font-tech text-slate-400 mt-1">
                  {selectedClient.telefono} {selectedClient.email ? `· ${selectedClient.email}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Ítems */}
          <div className="max-h-[42vh] overflow-y-auto px-5 lg:max-h-[46vh]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <ShoppingCart className="h-6 w-6" />
                </span>
                <p className="text-sm font-tech font-bold uppercase tracking-wider text-slate-400 mt-2">Aún no hay ítems</p>
                <p className="max-w-[220px] text-xs font-tech text-slate-500">
                  Agrega productos desde el panel izquierdo para construir la cotización.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {items.map((i) => (
                  <li key={i.product.id} className="flex items-start gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {i.product.nombre}
                      </p>
                      <p className="text-[10px] font-tech font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                        {currencyExact(Number(i.product.precio_base))} / {i.product.unidad_medida}
                      </p>
                      <div className="mt-2 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950/50 p-0.5 w-max">
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          aria-label="Disminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-white">
                          {i.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {i.product.recommendations && i.product.recommendations.length > 0 && (
                        <div className="mt-3 bg-slate-900/40 rounded-lg p-2 border border-slate-800/50">
                          <p className="text-[10px] font-tech text-brand-blue uppercase tracking-widest mb-2 font-semibold">Accesorios Sugeridos</p>
                          <div className="space-y-1.5">
                            {i.product.recommendations.map(rec => {
                              const alreadyInQuote = items.some(it => it.product.id === rec.recommended.id);
                              return (
                                <div key={rec.recommended.id} className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] text-slate-300 truncate max-w-[120px] lg:max-w-[140px]" title={rec.recommended.nombre}>
                                    {rec.recommended.nombre}
                                  </span>
                                  {!alreadyInQuote ? (
                                    <button 
                                      type="button" 
                                      onClick={() => addDirectItem(rec.recommended, i.qty)}
                                      className="text-[10px] bg-slate-800 hover:bg-brand-blue hover:text-slate-950 hover:bg-brand-cyan text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors whitespace-nowrap font-medium"
                                    >
                                      <Plus className="w-2.5 h-2.5" /> Agregar
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-brand-green/80 flex items-center gap-0.5 px-1.5 py-0.5 bg-brand-green/10 rounded">
                                      <Check className="w-2.5 h-2.5" /> Agregado
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                    </div>
                    <div className="text-right flex flex-col items-end justify-between h-full">
                      <p className="text-sm font-semibold text-emerald-400 font-mono">
                        {currencyExact(Number(i.product.precio_base) * i.qty)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(i.product.id)}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] font-tech font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Totales */}
          <div className="border-t border-slate-800 bg-slate-950/60 p-5 mt-auto">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Subtotal</dt>
                <dd className="font-mono font-medium text-white">{currencyExact(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">IVA (16%)</dt>
                <dd className="font-mono font-medium text-white">{currencyExact(iva)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="requiere-factura"
                checked={requiereFactura}
                onCheckedChange={setRequiereFactura}
                className="data-[state=checked]:bg-brand-blue"
              />
              <Label htmlFor="requiere-factura" className="font-tech text-xs font-bold uppercase tracking-widest text-slate-400">
                Incluir IVA (Requiere Factura)
              </Label>
            </div>

            <dl className="mt-4 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <dt className="font-tech text-sm font-bold uppercase tracking-widest text-white">
                  Total
                </dt>
                <dd className="font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {currencyExact(total)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[11px] font-tech font-bold uppercase tracking-wider text-slate-400">Plantilla de PDF</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-brand-blue"
                >
                  <option value="ev_charger">Cargadores EV</option>
                  <option value="general">Cotización General (CCTV, etc)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chk-desglose"
                  checked={mostrarDesglose}
                  onChange={(e) => setMostrarDesglose(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-brand-blue focus:ring-brand-blue"
                />
                <label htmlFor="chk-desglose" className="text-[11px] font-tech text-slate-400 cursor-pointer">
                  Mostrar desglose de impuestos en PDF
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                onClick={saved ? resetBuilder : handleSave}
                disabled={(items.length === 0 || !selectedClient) && !saved}
                className={cn(
                  'h-12 w-full text-[11px] font-tech font-bold uppercase tracking-widest transition-all disabled:opacity-40',
                  saved
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-brand-blue text-slate-950 hover:bg-brand-cyan hover:bg-brand-blue/80 shadow-[0_0_15px_rgba(0,163,255,0.4)]',
                )}
              >
                {saved ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear nueva cotización
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {initialQuote?.id ? 'Guardar cambios' : 'Generar cotización y guardar'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!savedQuoteId}
                onClick={() => {
                  if (savedQuoteId) {
                    window.open(`/api/quotes/${savedQuoteId}/pdf`, '_blank')
                  }
                }}
                className={cn(
                  "h-12 w-full border-slate-700 bg-slate-900 text-[11px] font-tech font-bold uppercase tracking-widest transition-colors",
                  savedQuoteId ? "text-brand-blue hover:text-white border-brand-blue/50 hover:bg-brand-blue/20 hover:border-brand-blue" : "disabled:opacity-40 text-slate-500"
                )}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver PDF Generado
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>

    {/* SECCIÓN INFERIOR: PREVISUALIZACIÓN EN VIVO DEL PDF */}
    <div className="mx-auto mt-10 max-w-7xl">
      <Card className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue">
            Previsualización en Vivo del Documento
          </h3>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-tech uppercase tracking-wider">
            Tiempo Real
          </Badge>
        </div>
        <div className="bg-slate-50 md:bg-slate-900 py-4 px-0 md:p-8 rounded-xl flex justify-center shadow-inner overflow-hidden w-full">
          <div className="flex flex-col gap-8 w-full md:w-auto overflow-hidden md:overflow-visible">
            <div className="w-[340px] h-[500px] sm:w-[510px] sm:h-[730px] md:w-auto md:h-auto mx-auto overflow-hidden">
              <div className="w-[850px] min-h-[1202px] bg-white md:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] font-sans relative shrink-0 scale-[0.4] sm:scale-[0.6] md:scale-100 origin-top-left transition-all text-[#1F2937]">
                
                {/* Header (Top) */}
                <div className="flex justify-between items-start px-12 pt-12 pb-6">
                  <div className="max-w-[400px]">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/logo-zirian-cotizador.png" alt="Zirian Logo" className="h-12 w-auto" />
                    </div>
                    <h2 className="text-[#1C497B] font-bold text-lg leading-tight mb-2">Energía y sistemas, donde necesites</h2>
                    <p className="text-sm text-slate-500 mb-1 leading-snug">San José del Cabo, Baja California Sur</p>
                    <p className="text-sm text-slate-500 leading-snug">WhatsApp: (624) 6220525 | www.zirian.com</p>
                  </div>

                  <div className="text-right">
                    <h1 className="text-3xl font-black text-[#1C497B] tracking-wider mb-2 uppercase">Cotización</h1>
                    <p className="text-slate-400 font-mono text-sm"># DRAFT</p>
                  </div>
                </div>

                {/* Info Blocks */}
                <div className="flex px-12 mb-6 gap-0 border-t border-slate-300">
                  <div className="flex-1 border-r border-slate-300">
                    <div className="bg-[#1C497B] text-white font-bold text-xs px-2 py-1 uppercase tracking-wider">Cliente</div>
                    <div className="p-3 text-sm">
                      <p className="font-bold text-base mb-1">{selectedClient?.nombre || "[Nombre del Cliente]"}</p>
                      {selectedClient?.empresa && <p className="text-slate-700">{selectedClient.empresa}</p>}
                      <p className="text-slate-700">{selectedClient?.ubicacion || "[Dirección / Ubicación]"}</p>
                      {selectedClient?.telefono && <p className="text-slate-700 mt-1">{selectedClient.telefono}</p>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1C497B] text-white font-bold text-xs px-2 py-1 uppercase tracking-wider">Detalles de Emisión</div>
                    <div className="p-3 text-sm flex flex-col gap-1">
                      <p><span className="font-bold">Fecha:</span> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      <p><span className="font-bold">Validez:</span> {new Date(Date.now() + 15 * 86400000).toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      <p><span className="font-bold">Agente:</span> Zirian Team</p>
                    </div>
                  </div>
                </div>

                {/* Intro Text */}
                <div className="px-12 mb-4">
                  <p className="text-sm text-slate-700 mb-2">Estimado/a cliente:</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Es un gusto presentarle nuestra propuesta técnica para la integración de su ecosistema. En <strong>Zirian México</strong>, priorizamos la seguridad normativa y la eficiencia energética.
                  </p>
                </div>

                {/* Green/Teal Banner */}
                <div className="mx-12 mb-4 bg-[#25B150] text-white text-[11px] font-bold text-center py-1 uppercase tracking-wider">
                  {template === 'general'
                    ? 'Alta Ingeniería Eléctrica / Automatización / Videovigilancia / Redes / Sistemas'
                    : 'Cargadores EV / Paneles Solares / Riego automatizado / Aires Acondicionados / Portones Eléctricos / Redes Internet / Sistemas'}
                </div>

                {/* Table */}
                <div className="px-12 mb-4">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#1C497B] text-white">
                      <tr>
                        <th className="py-2 px-2 border border-slate-300 w-12 text-center">Cant</th>
                        <th className="py-2 px-2 border border-slate-300 w-48">Producto</th>
                        <th className="py-2 px-2 border border-slate-300">Descripción</th>
                        <th className="py-2 px-2 border border-slate-300 w-24 text-right">Precio</th>
                        <th className="py-2 px-2 border border-slate-300 w-12 text-center">IVA</th>
                        <th className="py-2 px-2 border border-slate-300 w-24 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {items.length === 0 ? (
                        <tr><td colSpan={8} className="py-8 text-center text-slate-400 italic">Agrega conceptos a la cotización</td></tr>
                      ) : items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="py-2 px-2 border border-slate-300 text-center font-bold">{item.qty}</td>
                          <td className="py-2 px-2 border border-slate-300">
                             <div className="font-bold text-slate-900">{item.product.nombre}</div>
                             {item.detalles && <div className="text-slate-500 mt-1 whitespace-pre-wrap">{item.detalles}</div>}
                          </td>
                          <td className="py-2 px-2 border border-slate-300 text-right">${Number(item.product.precio_base).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          <td className="py-2 px-2 border border-slate-300 text-center">{(requiereFactura || initialQuote?.impuestos > 0) ? '16%' : '0%'}</td>
                          <td className="py-2 px-2 border border-slate-300 text-right font-bold bg-slate-100">${(Number(item.product.precio_base) * item.qty * ((requiereFactura || initialQuote?.impuestos > 0) ? 1.16 : 1)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Box */}
                  <div className="flex mt-1">
                    <div className="w-1/2 p-2">
                      <p className="text-xs font-bold text-slate-800">Nota Técnica:</p>
                    </div>
                    <div className="w-1/2">
                      <table className="w-full text-xs text-right">
                        <tbody>
                          <tr>
                            <td className="py-1 px-2 font-bold w-1/2">Subtotal</td>
                            <td className="py-1 px-2">${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 font-bold">I.V.A. (16%)</td>
                            <td className="py-1 px-2">${iva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          </tr>
                          <tr className="text-lg text-[#1C497B]">
                            <td className="py-2 px-2 font-black uppercase tracking-wider">Total</td>
                            <td className="py-2 px-2 font-black">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>



                {/* Compromiso Zirian */}
                <div className="px-12 border-t-2 border-slate-300 pt-3">
                  <h3 className="text-[#1C497B] font-bold text-sm uppercase tracking-wider mb-2">Compromiso Zirian</h3>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <p className="text-xs text-slate-600 italic mb-4">
                        {template === 'general'
                          ? '"En Zirian México nos especializamos en soluciones tecnológicas adaptadas a su entorno, garantizando siempre los más altos estándares de calidad, seguridad y eficiencia."'
                          : '"En Zirian México nos especializamos en soluciones adaptadas al entorno de BCS, priorizando la compatibilidad técnica con marcas líderes."'}
                      </p>
                      <p className="text-xs font-bold text-[#1C497B]">System Administrator - Equipo Zirian México</p>
                    </div>
                    <div className="w-1/2 flex flex-col items-center">
                      <p className="text-xs font-bold text-[#1C497B] mb-2">Gracias por su confianza</p>
                      <div className="flex h-16 w-full mt-2">
                        <img src="/instalaciones-strip.jpg" alt="Instalaciones Zirian" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Green Legal Footer */}
                <div className="absolute bottom-6 left-6 right-6">
                  {template !== 'general' && (
                    <div className="bg-[#25B150] text-white p-3 mb-2">
                      <p className="text-[10px] font-bold text-center uppercase tracking-wider mb-2">
                        Mantenga su garantía: Contamos con certificación y cumplimiento estricto de la NOM-001-SEDE-2012 de Instalaciones Eléctricas.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3 text-[8px] leading-tight opacity-90 text-slate-500">
                      <div>
                        <p className="font-bold mb-0.5">1. ALCANCE DE LA OFERTA</p>
                        <p>La cotización cubre únicamente los conceptos descritos. Cualquier trabajo adicional será cotizado por separado.</p>
                        <p className="font-bold mt-1.5 mb-0.5">2. CONDICIONES DE GARANTÍA</p>
                        <p>Aplica sobre equipos instalados por Zirian. No cubre mal uso, variaciones de voltaje o fenómenos naturales.</p>
                      </div>
                      <div>
                        <p className="font-bold mb-0.5">3. RESPONSABILIDAD DEL CLIENTE</p>
                        <p>El cliente proveerá acceso seguro y es responsable de permisos (CFE/municipio) salvo pacto en contrario.</p>
                        <p className="font-bold mt-1.5 mb-0.5">4. SOPORTE Y ATENCIÓN</p>
                        <p>Atención remota para diagnósticos; visitas presenciales según disponibilidad fuera de BCS.</p>
                      </div>
                      <div>
                        <p className="font-bold mb-0.5">5. VALIDEZ Y PAGOS</p>
                        <p>Vigencia de 30 días. Requiere anticipo para inicio y saldo contra entrega. Retrasos suspenden la instalación.</p>
                        <p className="font-bold mt-1.5 mb-0.5">6. PROPIEDAD INTELECTUAL</p>
                        <p>Diseños y diagramas son propiedad de Zirian; prohibida su réplica sin autorización.</p>
                      </div>
                    </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1 font-bold">
                    <span>Página 1</span>
                    <span>{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
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
