'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X, Save, CheckCircle2 } from 'lucide-react'
import { updateSyscomSettings } from '@/app/actions/syscom-settings'
import { cn } from '@/lib/utils'

export default function SyscomSettingsForm({
  initialBrands,
  initialModels,
}: {
  initialBrands: string[]
  initialModels: string[]
}) {
  const [brands, setBrands] = useState<string[]>(initialBrands)
  const [models, setModels] = useState<string[]>(initialModels)
  
  const [brandInput, setBrandInput] = useState('')
  const [modelInput, setModelInput] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  
  const [isPending, startTransition] = useTransition()

  const handleAddBrand = () => {
    if (!brandInput.trim()) return
    const val = brandInput.trim().toUpperCase()
    if (!brands.includes(val)) {
      setBrands([...brands, val])
    }
    setBrandInput('')
  }

  const handleAddModel = () => {
    if (!modelInput.trim()) return
    const val = modelInput.trim().toUpperCase()
    if (!models.includes(val)) {
      setModels([...models, val])
    }
    setModelInput('')
  }

  const handleSave = () => {
    setSaveMessage('')
    startTransition(async () => {
      try {
        await updateSyscomSettings(brands, models)
        setSaveMessage('¡Guardado correctamente!')
        setTimeout(() => setSaveMessage(''), 3000)
      } catch (error) {
        alert('Ocurrió un error al guardar')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Brands */}
      <div className="space-y-3">
        <Label className="text-sm font-tech font-bold uppercase tracking-wider text-slate-300">
          Marcas Permitidas (Whitelist)
        </Label>
        <p className="text-xs text-slate-500">
          Solo los productos que pertenezcan a estas marcas se mostrarán en los resultados de Syscom. Ej. HIKVISION, ECOFLOW.
        </p>
        <div className="flex gap-2">
          <Input 
            value={brandInput}
            onChange={(e) => setBrandInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBrand() } }}
            placeholder="Escribe una marca y presiona Enter..."
            className="bg-slate-950/50 border-slate-800 focus-visible:ring-brand-cyan"
          />
          <Button type="button" variant="outline" onClick={handleAddBrand} className="border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {brands.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No hay marcas configuradas.</span>
          ) : (
            brands.map((b) => (
              <span key={b} className="group inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 py-1 pl-3 pr-1.5 text-xs text-brand-cyan font-bold tracking-wider uppercase">
                {b}
                <button
                  type="button"
                  onClick={() => setBrands(brands.filter((x) => x !== b))}
                  className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-brand-cyan/20 text-brand-cyan hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="h-px w-full bg-slate-800/50" />

      {/* Models / SKUs */}
      <div className="space-y-3">
        <Label className="text-sm font-tech font-bold uppercase tracking-wider text-slate-300">
          Modelos o SKUs Excepcionales
        </Label>
        <p className="text-xs text-slate-500">
          Si quieres permitir un producto específico sin permitir toda su marca, agrega su Modelo o ID (SKU) aquí.
        </p>
        <div className="flex gap-2">
          <Input 
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddModel() } }}
            placeholder="Escribe un modelo exacto..."
            className="bg-slate-950/50 border-slate-800 focus-visible:ring-brand-green"
          />
          <Button type="button" variant="outline" onClick={handleAddModel} className="border-brand-green/30 text-brand-green hover:bg-brand-green/10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {models.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No hay modelos configurados.</span>
          ) : (
            models.map((m) => (
              <span key={m} className="group inline-flex items-center gap-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 py-1 pl-3 pr-1.5 text-xs text-brand-green font-bold tracking-wider uppercase">
                {m}
                <button
                  type="button"
                  onClick={() => setModels(models.filter((x) => x !== m))}
                  className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-brand-green/20 text-brand-green hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-4">
        {saveMessage && (
          <span className="text-emerald-400 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {saveMessage}
          </span>
        )}
        <Button 
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-brand-cyan text-slate-950 hover:bg-brand-cyan/80 font-tech font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,200,0.3)]"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Filtros
        </Button>
      </div>
    </div>
  )
}
