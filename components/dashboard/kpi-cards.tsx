import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn, } from '@/lib/utils'
import { kpis, currency } from '@/lib/data'

export function KpiCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const positive = kpi.delta >= 0
        const display =
          kpi.prefix === '$' ? currency(kpi.value) : kpi.value.toLocaleString('es-MX')
        return (
          <Card
            key={kpi.key}
            className="relative overflow-hidden border-border/80 bg-card p-4 sm:p-5"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-cyan/5 blur-2xl" />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-display mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              {display}
            </p>
            <div
              className={cn(
                'mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                positive
                  ? 'bg-brand-green/12 text-brand-green'
                  : 'bg-destructive/15 text-destructive',
              )}
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {positive ? '+' : ''}
              {kpi.delta}%
            </div>
          </Card>
        )
      })}
    </div>
  )
}
