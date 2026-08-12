'use client'

import { useState } from 'react'
import { Check, Package, ArchiveBox } from 'lucide-react'
import { toggleBOMItem } from '@/app/actions/field'

interface BOMItem {
  id: number
  descripcion: string
  cantidad: number
  unidad_medida: string
  cantidad_usada: number | null
  stock_general: number
}

interface ChecklistBOMProps {
  items: BOMItem[]
}

export function ChecklistBOM({ items }: ChecklistBOMProps) {
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set())
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>(
    items.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.cantidad_usada !== null && item.cantidad_usada >= item.cantidad
    }), {})
  )

  const handleToggle = async (item: BOMItem) => {
    const isCurrentlyChecked = checkedState[item.id] || false
    const newCheckedState = !isCurrentlyChecked

    // Optimistic UI Update
    setCheckedState(prev => ({ ...prev, [item.id]: newCheckedState }))
    setLoadingItems(prev => new Set(prev).add(item.id))

    try {
      await toggleBOMItem(item.id, newCheckedState, item.cantidad)
    } catch (error) {
      // Revert if failed
      setCheckedState(prev => ({ ...prev, [item.id]: isCurrentlyChecked }))
      alert("Error al guardar el estado. Revisa tu conexión.")
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }
  }

  // Sort: unchecked first, checked at bottom
  const sortedItems = [...items].sort((a, b) => {
    if (checkedState[a.id] === checkedState[b.id]) return 0
    return checkedState[a.id] ? 1 : -1
  })

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <Package className="h-5 w-5 text-muted-foreground" />
        Lista de Surtido (BOM)
      </h2>
      <p className="text-xs text-muted-foreground">Palomea los materiales físicos cuando los cargues a la unidad.</p>
      
      <ul className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {sortedItems.map((item) => {
          const isChecked = checkedState[item.id] || false
          const isFromStock = item.stock_general > 0
          
          return (
            <li 
              key={item.id} 
              onClick={() => handleToggle(item)}
              className={`p-4 flex items-start gap-4 cursor-pointer transition-colors ${isChecked ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
            >
              <button 
                className={`mt-0.5 flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isChecked 
                    ? 'bg-brand-green border-brand-green text-white' 
                    : 'border-muted-foreground/30 text-transparent'
                }`}
                disabled={loadingItems.has(item.id)}
              >
                <Check className="h-4 w-4" />
              </button>
              
              <div className="flex-1">
                <p className={`font-medium text-sm transition-all ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.descripcion}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isFromStock ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isFromStock ? 'Almacén' : 'Comprar'}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">x{item.cantidad} {item.unidad_medida}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
