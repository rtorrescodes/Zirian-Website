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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  clients,
  products,
  categories,
  currencyExact,
  currency,
  IVA_RATE,
  type Category,
  type Client,
  type Product,
} from '@/lib/data'

interface LineItem {
  product: Product
  qty: number
}

interface Attachment {
  id: string
  name: string
  size: string
}

const clientTypeColor: Record<Client['type'], string> = {
  Residencial: 'text-brand-cyan',
  Hotelero: 'text-brand-green',
  Comercial: 'text-amber-300',
  Airbnb: 'text-violet-300',
}

export function QuoteBuilder() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientOpen, setClientOpen] = useState(false)
  const [clientQuery, setClientQuery] = useState('')

  const [activeCategory, setActiveCategory] = useState<Category>('Cargadores')
  const [productQuery, setProductQuery] = useState('')
  const [pickedProductId, setPickedProductId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)

  const [items, setItems] = useState<LineItem[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: 'a1', name: 'Catálogo_Cargadores_2026.pdf', size: '2.4 MB' },
  ])
  const fileRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState(false)

  const filteredClients = useMemo(
    () =>
      clients.filter((c) =>
        `${c.name} ${c.location} ${c.type}`.toLowerCase().includes(clientQuery.toLowerCase()),
      ),
    [clientQuery],
  )

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.category === activeCategory &&
          `${p.name} ${p.sku} ${p.brand ?? ''}`
            .toLowerCase()
            .includes(productQuery.toLowerCase()),
      ),
    [activeCategory, productQuery],
  )

  const pickedProduct = products.find((p) => p.id === pickedProductId) ?? null

  const addItem = () => {
    if (!pickedProduct) return
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === pickedProduct.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === pickedProduct.id ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { product: pickedProduct, qty }]
    })
    setPickedProductId(null)
    setQty(1)
    setProductQuery('')
  }

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const removeItem = (id: string) =>
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

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const iva = subtotal * IVA_RATE
  const total = subtotal + iva

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.15fr_1fr]">
      {/* ============ PANEL IZQUIERDO ============ */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Cliente */}
        <Card className="border-border/80 bg-card p-4 sm:p-5">
          <SectionTitle icon={Building2} step="1" label="Cliente" />
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setClientOpen((o) => !o)}
              className="flex w-full items-center gap-3 rounded-lg border border-input bg-background px-3 py-2.5 text-left text-sm transition-colors hover:border-brand-cyan/40"
            >
              {selectedClient ? (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-cyan/15 text-xs font-semibold text-brand-cyan">
                    {selectedClient.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {selectedClient.name}
                    </span>
                    <span className={cn('block text-xs', clientTypeColor[selectedClient.type])}>
                      {selectedClient.type} · {selectedClient.location}
                    </span>
                  </span>
                </>
              ) : (
                <span className="flex-1 text-muted-foreground">Selecciona o busca un cliente…</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>

            {clientOpen && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                <div className="relative border-b border-border p-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={clientQuery}
                    onChange={(e) => setClientQuery(e.target.value)}
                    placeholder="Buscar cliente…"
                    className="h-9 border-0 bg-transparent pl-8 focus-visible:ring-0"
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto p-1">
                  {filteredClients.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(c)
                          setClientOpen(false)
                          setClientQuery('')
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-foreground">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">
                            {c.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {c.type} · {c.location}
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
        <Card className="border-border/80 bg-card p-4 sm:p-5">
          <SectionTitle icon={ShoppingCart} step="2" label="Agregar productos" />

          <Label className="mt-4 block text-xs uppercase tracking-wide text-muted-foreground">
            Categoría
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat)
                  setPickedProductId(null)
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  activeCategory === cat
                    ? 'border-brand-cyan/40 bg-brand-cyan/15 text-brand-cyan'
                    : 'border-border bg-background text-muted-foreground hover:border-brand-cyan/30 hover:text-foreground',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Label className="mt-4 block text-xs uppercase tracking-wide text-muted-foreground">
            Producto
          </Label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={productQuery}
              onChange={(e) => {
                setProductQuery(e.target.value)
                setPickedProductId(null)
              }}
              placeholder={`Buscar en ${activeCategory}…`}
              className="bg-background pl-9"
            />
          </div>

          <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
            {filteredProducts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setPickedProductId(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                    pickedProductId === p.id
                      ? 'border-brand-cyan/50 bg-brand-cyan/10'
                      : 'border-border bg-background hover:border-border/80 hover:bg-secondary/50',
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    <Zap className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {p.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.sku} · {p.brand ?? p.category}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-foreground">
                      {currency(p.price)}
                    </span>
                    <span className="block text-xs text-muted-foreground">/{p.unit}</span>
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

          {/* Cantidad + agregar */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-input bg-background p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-12 bg-transparent text-center text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Cantidad"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              onClick={addItem}
              disabled={!pickedProduct}
              className="flex-1 bg-brand-cyan font-semibold text-primary-foreground hover:bg-brand-cyan/90 disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              Agregar a la cotización
            </Button>
          </div>
        </Card>

        {/* Adjuntos */}
        <Card className="border-border/80 bg-card p-4 sm:p-5">
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
            className="mt-3 w-full border-dashed border-border bg-background hover:border-brand-cyan/40 hover:bg-secondary/40"
          >
            <Paperclip className="h-4 w-4" />
            Adjuntar catálogo PDF
          </Button>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <span
                  key={a.id}
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-2 pr-1 text-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-brand-cyan" />
                  <span className="max-w-[160px] truncate font-medium text-foreground">
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
        <Card className="overflow-hidden border-border/80 bg-card">
          {/* Encabezado del recibo */}
          <div className="relative border-b border-border bg-secondary/30 p-5 hex-pattern">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                  Cotización
                </p>
                <p className="mt-0.5 font-mono text-xs text-brand-cyan">
                  COT-{new Date().getFullYear()}-{String(items.length + 1043).padStart(4, '0')}
                </p>
              </div>
              <Badge variant="outline" className="border-brand-green/30 bg-brand-green/10 text-brand-green">
                Borrador
              </Badge>
            </div>
            <div className="mt-4 rounded-lg border border-border/60 bg-background/50 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Cliente
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {selectedClient ? selectedClient.name : 'Sin asignar'}
              </p>
              {selectedClient && (
                <p className="text-xs text-muted-foreground">
                  {selectedClient.contact} · {selectedClient.location}
                </p>
              )}
            </div>
          </div>

          {/* Ítems */}
          <div className="max-h-[42vh] overflow-y-auto px-5 lg:max-h-[46vh]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                  <ShoppingCart className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-foreground">Aún no hay ítems</p>
                <p className="max-w-[220px] text-xs text-muted-foreground">
                  Agrega productos desde el panel izquierdo para construir la cotización.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/60">
                {items.map((i) => (
                  <li key={i.product.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {i.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currencyExact(i.product.price)} / {i.product.unit}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 rounded-md border border-input bg-background p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, -1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Disminuir"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-foreground">
                          {i.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(i.product.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Aumentar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {currencyExact(i.product.price * i.qty)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(i.product.id)}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
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
          <div className="border-t border-border bg-secondary/20 p-5">
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{currencyExact(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">IVA (16%)</dt>
                <dd className="font-medium text-foreground">{currencyExact(iva)}</dd>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-3">
                <dt className="font-display text-base font-semibold uppercase tracking-wide text-foreground">
                  Total
                </dt>
                <dd className="font-display text-2xl font-bold text-brand-green">
                  {currencyExact(total)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={items.length === 0 || !selectedClient}
                className={cn(
                  'h-12 w-full text-sm font-semibold transition-all disabled:opacity-40',
                  saved
                    ? 'bg-brand-green text-primary-foreground'
                    : 'bg-brand-green text-primary-foreground hover:bg-brand-green/90 glow-green',
                )}
              >
                {saved ? (
                  <>
                    <Check className="h-5 w-5" />
                    Cotización guardada
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Generar cotización y guardar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={items.length === 0}
                className="h-11 w-full border-border bg-background text-sm font-medium hover:bg-secondary/50 disabled:opacity-40"
              >
                <Eye className="h-4 w-4" />
                Vista previa PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
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
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-cyan/15 text-xs font-bold text-brand-cyan">
        {step}
      </span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
        {label}
      </h2>
    </div>
  )
}
