'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { revenueByMonth, pipeline, leadSources, trafficByDay, currency } from '@/lib/data'

/* ---------- Ingresos: cotizado vs cerrado ---------- */
const revenueConfig = {
  cotizado: { label: 'Cotizado', color: 'var(--chart-1)' },
  cerrado: { label: 'Cerrado', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <ChartContainer config={revenueConfig} className="h-[260px] w-full">
      <AreaChart data={revenueByMonth} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillCotizado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cotizado)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-cotizado)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="fillCerrado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-cerrado)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-cerrado)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          className="text-xs"
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => currency(Number(v))} />}
        />
        <Area
          dataKey="cotizado"
          type="monotone"
          stroke="var(--color-cotizado)"
          strokeWidth={2}
          fill="url(#fillCotizado)"
        />
        <Area
          dataKey="cerrado"
          type="monotone"
          stroke="var(--color-cerrado)"
          strokeWidth={2}
          fill="url(#fillCerrado)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

/* ---------- Pipeline CRM ---------- */
const pipelineConfig = {
  value: { label: 'Oportunidades', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function PipelineChart() {
  return (
    <ChartContainer config={pipelineConfig} className="h-[240px] w-full">
      <BarChart
        data={pipeline}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          tickLine={false}
          axisLine={false}
          width={104}
          className="text-xs"
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="value" radius={6} fill="var(--color-value)" barSize={20} />
      </BarChart>
    </ChartContainer>
  )
}

/* ---------- Fuentes de leads (donut) ---------- */
const leadConfig = {
  value: { label: 'Leads' },
  google: { label: 'Google Ads', color: 'var(--chart-1)' },
  organico: { label: 'Orgánico', color: 'var(--chart-2)' },
  referidos: { label: 'Referidos', color: 'var(--chart-3)' },
  directo: { label: 'Directo', color: 'var(--chart-4)' },
} satisfies ChartConfig

export function LeadSourcesChart() {
  const total = leadSources.reduce((s, d) => s + d.value, 0)
  return (
    <ChartContainer config={leadConfig} className="mx-auto aspect-square h-[240px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="source" hideLabel />} />
        <Pie
          data={leadSources}
          dataKey="value"
          nameKey="source"
          innerRadius={62}
          outerRadius={92}
          strokeWidth={3}
          stroke="var(--card)"
        >
          {leadSources.map((entry) => (
            <Cell key={entry.source} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground font-display text-2xl font-bold"
                    >
                      {total}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      leads
                    </tspan>
                  </text>
                )
              }
              return null
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

/* ---------- Tráfico Google Analytics ---------- */
const trafficConfig = {
  sesiones: { label: 'Sesiones', color: 'var(--chart-1)' },
  conversiones: { label: 'Conversiones', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function TrafficChart() {
  return (
    <ChartContainer config={trafficConfig} className="h-[220px] w-full">
      <LineChart data={trafficByDay} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
        <YAxis tickLine={false} axisLine={false} width={32} className="text-xs" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="sesiones"
          type="monotone"
          stroke="var(--color-sesiones)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="conversiones"
          type="monotone"
          stroke="var(--color-conversiones)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
