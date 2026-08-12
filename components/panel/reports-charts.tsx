"use client";

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartData {
  name: string;
  value?: number;
  revenue?: number;
}

interface ReportsChartsProps {
  monthlyRevenueChart: ChartData[];
  projectDistributionChart: ChartData[];
}

const COLORS_PROJECTS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl font-tech">
        <p className="text-white font-bold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
            {entry.name === 'revenue' || entry.name === 'value' ? '' : `${entry.name}: `}
            {entry.name === 'revenue'
              ? `$${Number(entry.value).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsCharts({ monthlyRevenueChart, projectDistributionChart }: ReportsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfica de Rendimiento Anual (Líneas / Tendencia) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-md h-[400px] flex flex-col">
        <div className="mb-6">
          <h4 className="text-slate-200 font-tech text-sm uppercase tracking-wider font-bold">Rendimiento Comercial Anual</h4>
          <p className="text-xs text-slate-400 mt-1">Evolución de ingresos cerrados</p>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          {monthlyRevenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs font-tech">
              No hay datos de ingresos suficientes.
            </div>
          )}
        </div>
      </div>

      {/* Distribución de Proyectos (Dona) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-md h-[400px] flex flex-col">
        <div className="mb-2">
          <h4 className="text-slate-200 font-tech text-sm uppercase tracking-wider font-bold">Distribución por Origen</h4>
          <p className="text-xs text-slate-400 mt-1">Canales de captación de clientes</p>
        </div>
        
        <div className="flex-1 w-full min-h-0 relative">
          {projectDistributionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistributionChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectDistributionChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PROJECTS[index % COLORS_PROJECTS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs font-tech">
              No hay datos de clientes.
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {projectDistributionChart.map((entry, idx) => (
            <div key={idx} className="flex items-center text-[10px] text-slate-300 font-tech font-semibold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS_PROJECTS[idx % COLORS_PROJECTS.length] }} />
              {entry.name}: {entry.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
