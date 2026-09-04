'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Sun,
  Home,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AcCapacityCalculatorProps {
  currentModel?: string;
  currentTitle?: string;
  locale?: string;
}

export function AcCapacityCalculator({
  currentModel = '',
  currentTitle = '',
  locale = 'es',
}: AcCapacityCalculatorProps) {
  const isEn = locale === 'en';
  const [isOpen, setIsOpen] = useState(true);
  const [areaM2, setAreaM2] = useState<number>(18);
  const [highSunExposure, setHighSunExposure] = useState<boolean>(true); // Default true for coastal regions!

  // Detect current product capacity
  const productText = `${currentModel} ${currentTitle}`.toLowerCase();
  let currentTons = 1.0;
  if (productText.includes('36000') || productText.includes('3 ton') || productText.includes('3ton') || productText.includes('36k')) {
    currentTons = 3.0;
  } else if (productText.includes('24000') || productText.includes('2 ton') || productText.includes('2ton') || productText.includes('24k')) {
    currentTons = 2.0;
  } else if (productText.includes('18000') || productText.includes('1.5 ton') || productText.includes('1.5ton') || productText.includes('18k')) {
    currentTons = 1.5;
  } else if (productText.includes('12000') || productText.includes('1 ton') || productText.includes('1ton') || productText.includes('12k')) {
    currentTons = 1.0;
  }

  // Calculate needed BTU
  // Base: 600 BTU per m2 in normal zone
  // In coastal / sunny: 750 BTU per m2 (+25%)
  const btuFactor = highSunExposure ? 750 : 600;
  const rawBtu = areaM2 * btuFactor;

  let recommendedTons = 1.0;
  let recommendedBtu = 12000;
  if (rawBtu > 26000) {
    recommendedTons = 3.0;
    recommendedBtu = 36000;
  } else if (rawBtu > 19000) {
    recommendedTons = 2.0;
    recommendedBtu = 24000;
  } else if (rawBtu > 13000) {
    recommendedTons = 1.5;
    recommendedBtu = 18000;
  } else {
    recommendedTons = 1.0;
    recommendedBtu = 12000;
  }

  const isExactMatch = currentTons === recommendedTons;
  const isUndersized = currentTons < recommendedTons;
  const isOversized = currentTons > recommendedTons;

  const presets = [
    { label: isEn ? 'Small Room' : 'Recámara chica', area: 12, sub: '10-14 m²' },
    { label: isEn ? 'Master Bedroom' : 'Recámara ppal.', area: 18, sub: '15-22 m²' },
    { label: isEn ? 'Living / Dining' : 'Sala / Comedor', area: 26, sub: '23-32 m²' },
    { label: isEn ? 'Open Space' : 'Espacio amplio', area: 38, sub: '33-45 m²' },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 my-4 shadow-xl">
      {/* Header */}
      <div 
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {isEn ? 'AC Sizing Calculator' : 'Calculadora de Capacidad Térmica'}
              </h4>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {isEn ? 'Coastal Advisor' : 'Asesor Costero'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isEn ? 'Find the ideal tonnage for your room in Los Cabos & Riviera Maya' : 'Calcula la capacidad exacta para tu espacio en Los Cabos y Riviera Maya'}
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
          {/* Quick Presets */}
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-300 mb-2 block font-semibold">
              {isEn ? '1. Select room type or area:' : '1. Selecciona tipo de habitación o m²:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => {
                const active = areaM2 === p.area;
                return (
                  <button
                    key={p.area}
                    type="button"
                    onClick={() => setAreaM2(p.area)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      active
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-tight truncate">{p.label}</div>
                    <div className="text-[9px] font-mono text-cyan-400 mt-0.5">{p.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area Slider */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                {isEn ? 'Custom Area:' : 'Metros cuadrados exactos:'}
              </span>
              <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">
                {areaM2} m²
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={50}
              step={1}
              value={areaM2}
              onChange={(e) => setAreaM2(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>8 m² (Compacto)</span>
              <span>25 m²</span>
              <span>50 m² (Residencial amplio)</span>
            </div>
          </div>

          {/* Coastal Sun Exposure Switch */}
          <div
            onClick={() => setHighSunExposure(!highSunExposure)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              highSunExposure
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${highSunExposure ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold leading-tight">
                  {isEn ? 'Direct Sun / Coastal Heat Factor' : 'Sol Directo en Techo / Ventanales al Sol'}
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">
                  {isEn
                    ? 'Recommended for Baja California Sur & Riviera Maya (+20% thermal buffer)'
                    : 'Recomendado para Los Cabos y Riviera Maya (+20% margen térmico)'}
                </div>
              </div>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-1 rounded font-bold border ${
                highSunExposure
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
            >
              {highSunExposure ? (isEn ? 'ACTIVE (+20%)' : 'ACTIVADO (+20%)') : (isEn ? 'OFF' : 'DESACTIVADO')}
            </span>
          </div>

          {/* Recommendation Output Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  {isEn ? 'Calculated Requirement for your space:' : 'Capacidad requerida para tu espacio:'}
                </span>
                <div className="text-lg font-bold font-title text-white flex items-center gap-2 mt-0.5">
                  <span className="text-cyan-400">{recommendedTons} {isEn ? 'Ton' : 'Tonelada(s)'}</span>
                  <span className="text-xs font-mono text-slate-400 font-normal">
                    ({recommendedBtu.toLocaleString()} BTU/h)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  {isEn ? 'Equipment on this page:' : 'Equipo en esta pantalla:'}
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  {currentTons} {isEn ? 'Ton' : 'Tonelada(s)'}
                </span>
              </div>
            </div>

            {/* Match Status Banner */}
            {isExactMatch && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                <div className="text-xs leading-relaxed">
                  <strong>¡Coincidencia Ideal!</strong> Este equipo de <strong>{currentTons} Tonelada(s)</strong> tiene la potencia exacta para enfriar confortablemente tu espacio de <strong>{areaM2} m²</strong> sin sobrecargar el compresor.
                </div>
              </div>
            )}

            {isUndersized && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <div className="text-xs leading-relaxed">
                  Para <strong>{areaM2} m²</strong> te sugerimos un equipo de <strong>{recommendedTons} Tonelada(s)</strong> ({recommendedBtu.toLocaleString()} BTU). Este modelo ({currentTons} Ton) podría tardar más en enfriar en los días de mayor calor.
                </div>
              </div>
            )}

            {isOversized && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
                <div className="text-xs leading-relaxed">
                  Este equipo ({currentTons} Ton) es más potente que el mínimo requerido ({recommendedTons} Ton). Al ser <strong>Full Inverter</strong>, modulará su potencia ahorrando energía y enfriará tu espacio en tiempo récord.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
