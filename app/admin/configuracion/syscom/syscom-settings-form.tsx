'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X, Save, CheckCircle2, ShieldBan, Trash2 } from 'lucide-react'
import { updateSyscomSettings, fetchSyscomProductAction } from '@/app/actions/syscom-settings'
import { removeFromSyscomBlacklist } from '@/app/actions/syscom-blacklist'
import { SyscomProduct } from '@/lib/syscom'
import { cn } from '@/lib/utils'

export default function SyscomSettingsForm({
  initialBrands,
  initialModels,
  initialCategoryMap = {},
  initialBlacklist,
  exceptionalProducts = [],
  blacklistedProducts = [],
}: {
  initialBrands: string[]
  initialModels: string[]
  initialCategoryMap?: Record<string, string>
  initialBlacklist: string[]
  exceptionalProducts?: SyscomProduct[]
  blacklistedProducts?: SyscomProduct[]
}) {
  const [brands, setBrands] = useState<string[]>(initialBrands)
  const [models, setModels] = useState<string[]>(initialModels)
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>(initialCategoryMap)
  const [blacklist, setBlacklist] = useState<string[]>(initialBlacklist)
  
  const [liveExceptionalProducts, setLiveExceptionalProducts] = useState<SyscomProduct[]>(exceptionalProducts)
  
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

  const handleAddModel = async () => {
    if (!modelInput.trim()) return
    let val = modelInput.trim().toUpperCase()
    
    // Extract ID if a URL is pasted
    const match = val.match(/(\d{5,8})/);
    if (match) {
      val = match[1];
    }
    
    if (!models.includes(val)) {
      setModels(prev => [...prev, val])
      
      // Fetch details instantly
      const p = await fetchSyscomProductAction(val);
      if (p) {
        setLiveExceptionalProducts(prev => [...prev, p])
      }
    }
    setModelInput('')
  }

  const handleSave = () => {
    setSaveMessage('')
    startTransition(async () => {
      try {
        await updateSyscomSettings(brands, models, categoryMap)
        setSaveMessage('¡Guardado correctamente!')
        setTimeout(() => setSaveMessage(''), 3000)
      } catch (error) {
        alert('Ocurrió un error al guardar')
      }
    })
  }

  const handleRemoveFromBlacklist = (productId: string) => {
    startTransition(async () => {
      try {
        await removeFromSyscomBlacklist(productId)
        setBlacklist(prev => prev.filter(id => id !== productId))
      } catch (error) {
        alert('Ocurrió un error al remover de la lista negra')
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
        
        <div className="mt-4">
          {models.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No hay modelos configurados.</span>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16">Imagen</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {models.map((m) => {
                    const prod = liveExceptionalProducts.find(p => String(p.producto_id) === m || p.modelo === m);
                    return (
                      <tr key={m} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          {prod?.img_portada ? (
                            <img src={prod.img_portada} alt={prod.modelo} className="w-10 h-10 object-contain bg-white rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">No img</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-200 line-clamp-1" title={prod?.titulo}>{prod?.titulo || 'Datos no encontrados...'}</div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="text-brand-cyan font-mono font-bold">ID: {m}</span>
                            {prod?.modelo && <span className="text-slate-500 font-mono">Mod: {prod.modelo}</span>}
                            <select 
                              value={categoryMap[m] || ''}
                              onChange={(e) => setCategoryMap(prev => ({ ...prev, [m]: e.target.value }))}
                              className="ml-4 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-cyan"
                            >
                              <option value="">Destacados (Default)</option>
                              <option value="cctv">CCTV & Seguridad</option>
                              <option value="redes">Redes</option>
                              <option value="acceso">Acceso</option>
                              <option value="cargador ev">Cargadores EV</option>
                              <option value="ecoflow">Baterías EcoFlow</option>
                              <option value="aufit">Aires Acondicionados</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setModels(models.filter((x) => x !== m))}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
          Guardar Configuración
        </Button>
      </div>
      
      {/* Blacklist View */}
      <div className="pt-8 border-t border-slate-800 mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldBan className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-white">Lista Negra de Productos</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">Estos productos fueron ocultados manualmente de la tienda pública.</p>
        
        {blacklist.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No hay productos en la lista negra.</p>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16">Imagen</th>
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {blacklist.map(id => {
                    const prod = blacklistedProducts.find(p => p.producto_id === id);
                    return (
                      <tr key={id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          {prod?.img_portada ? (
                            <img src={prod.img_portada} alt={prod.modelo} className="w-10 h-10 object-contain bg-white rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500">No img</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-200 line-clamp-1" title={prod?.titulo}>{prod?.titulo || 'ID ocultado'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            <span className="text-brand-cyan font-mono font-bold">ID: {id}</span>
                            {prod?.modelo && <span className="ml-2 text-slate-500 font-mono">Mod: {prod.modelo}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveFromBlacklist(id)}
                            disabled={isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 px-2"
                            title="Quitar de lista negra"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Restaurar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

    </div>
  )
}
