import { AppShell } from "@/components/panel/app-shell"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  // Fetch some basic stats
  const totalQuotes = await prisma.quote.count()
  const approvedQuotes = await prisma.quote.count({ where: { status: 'Aprobado' } })
  const totalClients = await prisma.client.count()
  const totalOrders = await prisma.serviceOrder.count()

  // Fake financial data for demonstration
  const monthlyRevenue = 458000
  const growth = 12.5

  return (
    <AppShell title="Reportes y Analíticas" subtitle="Visualiza el rendimiento general y financiero de la empresa.">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-tech text-3xl font-bold uppercase tracking-widest text-white">
              Visión General
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Resumen de actividad operativa y comercial
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue px-4 py-2 rounded-lg font-tech text-xs uppercase tracking-wider font-bold hover:bg-brand-blue/20 transition-colors">
              Exportar CSV
            </button>
            <button className="bg-brand-green hover:bg-brand-greenDark text-brand-dark px-4 py-2 rounded-lg font-tech text-xs uppercase tracking-wider font-bold transition-colors">
              Descargar PDF
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Ingresos (Mensual)</p>
                <h3 className="text-2xl font-bold text-white mt-1">${monthlyRevenue.toLocaleString('es-MX')}</h3>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-emerald-400 text-xs mt-4 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" /> +{growth}% vs mes anterior
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Cotizaciones Totales</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalQuotes}</h3>
              </div>
              <div className="bg-brand-blue/10 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-brand-blue" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              <span className="text-emerald-400 font-bold">{approvedQuotes}</span> aprobadas
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Base de Clientes</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalClients}</h3>
              </div>
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              Crecimiento constante
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Órdenes Técnicas</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalOrders}</h3>
              </div>
              <div className="bg-orange-500/10 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              En historial
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-900/60 h-96 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full p-4 border-b border-slate-800">
              <h4 className="text-slate-200 font-tech text-sm uppercase tracking-wider font-bold">Rendimiento Comercial Anual</h4>
            </div>
            <BarChart3 className="w-16 h-16 text-slate-800 mb-4" />
            <p className="text-slate-500 font-tech uppercase tracking-widest text-xs">Módulo de Gráficas en Construcción</p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 h-96 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full p-4 border-b border-slate-800">
              <h4 className="text-slate-200 font-tech text-sm uppercase tracking-wider font-bold">Distribución de Proyectos por Tipo</h4>
            </div>
            <Activity className="w-16 h-16 text-slate-800 mb-4" />
            <p className="text-slate-500 font-tech uppercase tracking-widest text-xs">Módulo de Gráficas en Construcción</p>
          </Card>
        </div>

      </div>
    </AppShell>
  )
}
