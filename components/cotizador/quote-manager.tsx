'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Box, ShoppingCart, MessageCircle, Copy, Check } from 'lucide-react'

interface QuoteManagerProps {
  quote: any;
}

export function QuoteManager({ quote }: QuoteManagerProps) {
  
  // Local state to simulate assigning items to stock vs buy
  const [itemsStatus, setItemsStatus] = useState<Record<number, 'stock' | 'buy'>>(
    quote.items.reduce((acc: any, item: any) => {
      // Por defecto, si hay stock_general > 0, lo ponemos como stock, si no a buy
      acc[item.id] = (item.product.stock_general && item.product.stock_general > 0) ? 'stock' : 'buy';
      return acc;
    }, {})
  )

  const [copiedProvider, setCopiedProvider] = useState<string | null>(null)

  const toggleStatus = (itemId: number, status: 'stock' | 'buy') => {
    setItemsStatus(prev => ({ ...prev, [itemId]: status }))
  }

  // Generar mensajes por proveedor
  const generateWhatsAppMessage = (providerName: string, contactName: string) => {
    const itemsToBuy = quote.items.filter((item: any) => itemsStatus[item.id] === 'buy')
    
    // Aquí podríamos filtrar itemsToBuy por el proveedor default, pero por simplicidad asumimos 
    // que el usuario elige a quién mandarle qué.
    // Filtrar los que coincidan con el providerName, o mandar la lista completa si no tienen provider_default
    const providerItems = itemsToBuy.filter((item: any) => 
      !item.product.proveedor_default || item.product.proveedor_default.includes(providerName)
    )

    if (providerItems.length === 0) return ''

    let message = `Hola ${contactName} saludos, buen dia, espero que te encuentres bien. Me ayudas a cotizar lo siguiente por favor:\n\n`
    providerItems.forEach((item: any) => {
      let unidad = item.product.unidad_medida || 'Pieza';
      if (item.product.nombre.toLowerCase().includes('cable')) {
        unidad = 'metros';
      }
      message += `* ${item.cantidad} ${unidad} de ${item.product.nombre}\n`
    })

    return message
  }

  const copyMessage = (providerName: string, contactName: string) => {
    const msg = generateWhatsAppMessage(providerName, contactName)
    if (!msg) {
      alert('No hay artículos marcados para comprar a este proveedor.')
      return
    }
    
    navigator.clipboard.writeText(msg)
    setCopiedProvider(providerName)
    setTimeout(() => setCopiedProvider(null), 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* Panel de Items */}
      <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-tech font-bold uppercase tracking-widest text-brand-cyan flex items-center gap-2">
            <Box className="w-4 h-4" />
            Materiales e Insumos
          </h2>
          <a 
            href={`/api/quotes/${quote.id}/bom-pdf`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-[10px] font-tech font-bold uppercase tracking-wider text-amber-500 transition-colors hover:bg-amber-500/20"
          >
            Imprimir BOM
          </a>
        </div>
        
        <div className="space-y-3">
          {quote.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/50">
              <div>
                <p className="text-sm font-medium text-white">{item.product.nombre}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Req: {item.cantidad} {item.product.unidad_medida} | Stock Actual: {item.product.stock_general || 0}
                </p>
              </div>
              <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700">
                <button
                  onClick={() => toggleStatus(item.id, 'stock')}
                  className={`px-3 py-1 text-[10px] font-tech font-bold uppercase tracking-wider rounded transition-colors ${
                    itemsStatus[item.id] === 'stock' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Cajuela (Stock)
                </button>
                <button
                  onClick={() => toggleStatus(item.id, 'buy')}
                  className={`px-3 py-1 text-[10px] font-tech font-bold uppercase tracking-wider rounded transition-colors ${
                    itemsStatus[item.id] === 'buy' 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Panel de WhatsApp y Financiero */}
      <div className="flex flex-col gap-6">
        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-xl">
          <h2 className="text-sm font-tech font-bold uppercase tracking-widest text-brand-cyan mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Pedidos por WhatsApp
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Genera los mensajes para solicitar cotización a los proveedores basándote en los ítems marcados como "Comprar".
          </p>

          <div className="space-y-4">
            {/* Dos Hermanos */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-950/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Dos Hermanos (Iker)</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[10px] font-tech tracking-wider border-slate-600 bg-slate-800 hover:bg-brand-green/20 hover:text-brand-green hover:border-brand-green"
                  onClick={() => copyMessage('Dos Hermanos', 'Iker')}
                >
                  {copiedProvider === 'Dos Hermanos' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar Mensaje
                </Button>
              </div>
            </div>

            {/* Enercom */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-950/50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">Enercom (Ingrid)</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-[10px] font-tech tracking-wider border-slate-600 bg-slate-800 hover:bg-brand-green/20 hover:text-brand-green hover:border-brand-green"
                  onClick={() => copyMessage('Enercom', 'Ingrid')}
                >
                  {copiedProvider === 'Enercom' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar Mensaje
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Info Financiera Básica */}
        <Card className="p-5 border-slate-800 bg-slate-900/60 shadow-xl">
          <h2 className="text-sm font-tech font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            Resumen Financiero
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Total Venta</span>
              <span className="font-mono text-emerald-400 font-bold">${Number(quote.total).toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Comisión Base</span>
              <span className="font-mono text-amber-400">${Number(quote.comision_fija || 1500).toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Utilidad Est. (60%)</span>
              <span className="font-mono text-brand-cyan">${(Number(quote.total) * 0.6).toLocaleString('es-MX')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
