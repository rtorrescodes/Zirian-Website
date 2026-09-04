'use client';

import React, { useState } from 'react';
import {
  Wind,
  ShieldCheck,
  Flame,
  VolumeX,
  Wifi,
  Leaf,
  FileDown,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function AufitStoreBanner() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 p-6 md:p-8 shadow-[0_0_30px_rgba(0,163,255,0.1)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-xs font-tech font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Climatización de Alta Gama
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Riviera Maya & Los Cabos
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-tech uppercase tracking-wide">
            AUFIT: Minisplits Inverter con Blindaje Anticorrosión Costero
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            En zonas de alta salinidad y calor extremo como <strong className="text-white">Riviera Maya</strong> (Cancún, Playa del Carmen, Tulum) y <strong className="text-white">Los Cabos</strong>, los minisplits comerciales sufren de fugas por salitre y caídas graves de enfriamiento. AUFIT integra <strong className="text-cyan-400">Serpentín Blue Fin</strong>, refrigerante ecológico <strong className="text-emerald-400">R32</strong> y opera continuo hasta <strong className="text-white">55°C</strong> con silencio absoluto de <strong className="text-white">23 dB</strong>.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-xs font-tech text-slate-400">
            <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              🛡️ Serpentín Blue Fin
            </span>
            <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              🌱 Gas R32 Ecológico
            </span>
            <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              🤫 23 dB Ultra Silencioso
            </span>
            <span className="bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              📱 WiFi + Alexa y Google
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-56">
          <a
            href="/marketing/aufit/brochure-aufit-minisplit.pdf"
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-tech font-bold uppercase tracking-wider transition-all text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <FileDown className="w-4 h-4" />
            Descargar Ficha PDF
          </a>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-tech font-bold uppercase tracking-wider transition-colors text-center"
          >
            <span>{showDetails ? 'Ocultar Comparativa' : 'Ver Guía de Tecnología'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable Technical Guide */}
      {showDetails && (
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
          {/* Card 1: Gas R32 vs R410A */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-emerald-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="w-4 h-4" /> 1. Refrigerante R32 vs R410A
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              El gas R32 es la nueva norma internacional: tiene <strong>68% menor impacto de calentamiento global (GWP)</strong>, consume menos energía por tonelada y transfiere el frío un 30% más rápido que el gas R410A saliente.
            </p>
          </div>

          {/* Card 2: Funciones & SEER */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-cyan-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4" /> 2. Eficiencias SEER 17 a 21
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contamos con modelos en <strong>Solo Frío</strong> y <strong>Frío y Calor (Heat Pump)</strong> a 110V y 220V. La tecnología Dual Inverter ajusta la velocidad milimétricamente para ahorrar hasta un 60% en tu recibo de CFE.
            </p>
          </div>

          {/* Card 3: Control Inteligente & Salud */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-amber-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
              <Wifi className="w-4 h-4" /> 3. WiFi + Esterilización Térmica
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contrólalo por voz con <strong>Alexa y Google Home</strong> o enciende tu minisplit antes de llegar desde tu celular. Su ciclo de auto-limpieza seca y esteriliza el serpentín, evitando moho y malos olores por humedad.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
