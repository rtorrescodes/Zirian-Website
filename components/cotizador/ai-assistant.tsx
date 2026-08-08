'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2 } from 'lucide-react'

interface AiAssistantProps {
  currentItems: any[]
  availableProducts: any[]
  onUpdateItems: (newItems: any[]) => void
}

export function AiAssistant({ currentItems, availableProducts, onUpdateItems }: AiAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAskAI = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          currentItems,
          availableProducts
        })
      })

      const data = await res.json()
      
      if (data.newItems) {
        // Mapear los items devueltos con los productos completos del catálogo
        const mappedItems = data.newItems.map((aiItem: any) => {
          const product = availableProducts.find(p => p.id === aiItem.productId)
          return {
            product: product || { id: aiItem.productId, nombre: "Producto Desconocido", precio_base: 0, unidad_medida: "Pza" },
            qty: aiItem.qty,
            detalles: aiItem.detalles || ''
          }
        })
        onUpdateItems(mappedItems)
        setPrompt('')
      } else {
        console.error("AI no devolvió newItems", data)
      }

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h2 className="font-tech text-sm font-bold uppercase tracking-widest text-indigo-300">
          Asistente de Cotización (AI)
        </h2>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ej: Quita el cable verde y cambia el calibre del negro a 10..."
        className="resize-none h-16 border-indigo-500/30 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 mb-3 text-sm"
        disabled={loading}
      />

      <Button
        onClick={handleAskAI}
        disabled={loading || !prompt.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-tech font-bold uppercase tracking-widest text-xs h-10 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            Modificar con IA
          </>
        )}
      </Button>
    </Card>
  )
}
