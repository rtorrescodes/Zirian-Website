"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartData {
  name: string;
  value?: number;
  revenue?: number;
}

interface DashboardAnalyticsProps {
  monthlyRevenue: ChartData[];
  leadData: ChartData[];
  ticketData: ChartData[];
}

const COLORS_LEADS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
const COLORS_TICKETS = ['#ef4444', '#10b981', '#64748b', '#f59e0b'];

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

export function DashboardAnalytics({ monthlyRevenue, leadData, ticketData }: DashboardAnalyticsProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Monthly Revenue Bar Chart */}
      <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-md">
        <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider mb-1">Ingresos Mensuales</h3>
        <p className="text-xs text-slate-400 mb-6">Crecimiento de ventas (Cotizaciones Aprobadas/Cerradas)</p>
        
        <div className="h-[250px] w-full">
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500 text-xs font-tech">
              No hay datos de ingresos aún.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Leads Pie Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-md flex-1 flex flex-col">
          <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider mb-1">Estado de Leads</h3>
          <p className="text-xs text-slate-400 mb-2">Conversión de prospectos calificados</p>
          <div className="flex-1 min-h-[150px] relative">
            {leadData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {leadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_LEADS[index % COLORS_LEADS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs font-tech">
                No hay datos
              </div>
            )}
          </div>
          {/* Custom Legend for Leads */}
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {leadData.map((entry, idx) => (
              <div key={idx} className="flex items-center text-[9px] text-slate-300 font-tech">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS_LEADS[idx % COLORS_LEADS.length] }} />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </div>

        {/* Tickets Pie Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-md flex-1 flex flex-col">
          <h3 className="font-tech text-sm font-bold text-white uppercase tracking-wider mb-1">Salud de Soporte</h3>
          <p className="text-xs text-slate-400 mb-2">Distribución de tickets técnicos</p>
          <div className="flex-1 min-h-[150px] relative">
            {ticketData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={60}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {ticketData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_TICKETS[index % COLORS_TICKETS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs font-tech">
                No hay datos
              </div>
            )}
          </div>
          {/* Custom Legend for Tickets */}
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {ticketData.map((entry, idx) => (
              <div key={idx} className="flex items-center text-[9px] text-slate-300 font-tech">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS_TICKETS[idx % COLORS_TICKETS.length] }} />
                {entry.name}: {entry.value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
