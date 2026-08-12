import { getSyscomSettings } from '@/app/actions/syscom-settings'
import { getSyscomBlacklist } from '@/app/actions/syscom-blacklist'
import { getSyscomProductsByIds } from '@/lib/syscom'
import { AppShell } from '@/components/panel/app-shell'
import SyscomSettingsForm from './syscom-settings-form'
import { Database, Filter } from 'lucide-react'

export const metadata = {
  title: 'Configuración Syscom | Zirian',
}

export default async function SyscomSettingsPage() {
  const config = await getSyscomSettings()
  const blacklist = await getSyscomBlacklist()
  
  const blacklistedProducts = await getSyscomProductsByIds(blacklist)
  const exceptionalProducts = await getSyscomProductsByIds(config.models)

  return (
    <AppShell title="Catálogo Syscom" subtitle="Filtros y configuración de base de datos Syscom">
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-4 sm:p-6">
        <div>
        <h1 className="text-2xl font-tech font-bold uppercase tracking-widest text-white">Gestor de Catálogo Syscom</h1>
        <p className="mt-1 text-sm text-slate-400">Administra las marcas y modelos permitidos para importar desde Syscom hacia tu CRM y Tienda Virtual.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border border-brand-cyan/20 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-cyan/10 rounded-lg border border-brand-cyan/20">
              <Filter className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-tech uppercase tracking-widest">Filtros Activos</h2>
              <p className="text-sm text-slate-400">Si dejas ambos vacíos, el buscador traerá TODO el catálogo de Syscom (no recomendado).</p>
            </div>
          </div>
          
          <SyscomSettingsForm 
            initialBrands={config.brands} 
            initialModels={config.models} 
            initialCategoryMap={config.categoryMap}
            initialBlacklist={blacklist}
            blacklistedProducts={blacklistedProducts}
            exceptionalProducts={exceptionalProducts}
          />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
