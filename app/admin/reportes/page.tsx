import { AppShell } from "@/components/panel/app-shell"
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { getReportsData } from "@/app/actions/reports"
import { ReportsCharts } from "@/components/panel/reports-charts"

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const data = await getReportsData()

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
          <Card className="border-slate-800 bg-slate-900/60 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex justify-between items-start relative">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Ingresos (Mensual)</p>
                <h3 className="text-2xl font-bold text-white mt-1">${data.currentMonthRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}</h3>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className={`text-xs mt-4 flex items-center gap-1 font-bold ${Number(data.growth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`w-3 h-3 ${Number(data.growth) >= 0 ? '' : 'rotate-180'}`} /> {Number(data.growth) >= 0 ? '+' : ''}{data.growth}% vs mes anterior
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Cotizaciones Totales</p>
                <h3 className="text-2xl font-bold text-white mt-1">{data.totalQuotes}</h3>
              </div>
              <div className="bg-brand-blue/10 p-2 rounded-lg">
                <BarChart3 className="w-5 h-5 text-brand-blue" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              <span className="text-emerald-400 font-bold">{data.approvedQuotes}</span> ganadas (aprobadas)
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 font-tech text-xs uppercase tracking-wider">Base de Clientes</p>
                <h3 className="text-2xl font-bold text-white mt-1">{data.totalClients}</h3>
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
                <h3 className="text-2xl font-bold text-white mt-1">{data.totalOrders}</h3>
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
        <ReportsCharts 
          monthlyRevenueChart={data.monthlyRevenueChart} 
          projectDistributionChart={data.projectDistributionChart} 
        />

      </div>
    </AppShell>
  )
}
