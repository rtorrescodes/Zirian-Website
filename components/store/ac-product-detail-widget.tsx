'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  MapPin,
  Wrench,
  Sparkles,
  MessageCircle,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { AcQuoteModal } from './ac-quote-modal';
import { Badge } from '@/components/ui/badge';

interface AcProductDetailWidgetProps {
  productId: string;
  productTitle: string;
  productModel: string;
  productBrand: string;
  productImage?: string | null;
  rawCostMxn: number; // Costo base con IVA
  locale: string;
}

export function AcProductDetailWidget({
  productId,
  productTitle,
  productModel,
  productBrand,
  productImage,
  rawCostMxn,
  locale,
}: AcProductDetailWidgetProps) {
  const [selectedRegion, setSelectedRegion] = useState<'riviera_maya' | 'baja_california_sur'>('riviera_maya');

  // Pricing rules:
  // Riviera Maya: Costo con IVA + $1,000 (Zirian) + $1,000 (Polo) = +$2,000
  // BCS: Costo con IVA + $1,500
  const priceMxn = selectedRegion === 'riviera_maya'
    ? Math.round(rawCostMxn + 2000)
    : Math.round(rawCostMxn + 1500);

  const isEn = locale === 'en';

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 mb-8 border border-cyan-500/30 shadow-[0_0_25px_rgba(0,163,255,0.1)] space-y-6">
      {/* Region Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-tech font-bold uppercase tracking-wider text-slate-400">
            {isEn ? 'Select your region for quote:' : 'Selecciona tu zona para cotización:'}
          </span>
          <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[10px] font-tech font-bold uppercase">
            Entrega Local
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSelectedRegion('riviera_maya')}
            className={`py-2.5 px-3 rounded-xl font-tech text-xs font-bold uppercase tracking-wider transition-all text-center border ${
              selectedRegion === 'riviera_maya'
                ? 'bg-brand-blue/20 border-brand-blue text-white shadow-[0_0_12px_rgba(0,163,255,0.25)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            🌴 Riviera Maya
          </button>

          <button
            type="button"
            onClick={() => setSelectedRegion('baja_california_sur')}
            className={`py-2.5 px-3 rounded-xl font-tech text-xs font-bold uppercase tracking-wider transition-all text-center border ${
              selectedRegion === 'baja_california_sur'
                ? 'bg-brand-blue/20 border-brand-blue text-white shadow-[0_0_12px_rgba(0,163,255,0.25)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            🌵 Los Cabos & BCS
          </button>
        </div>
      </div>

      {/* Trust & Guarantee points */}
      <div className="flex flex-col gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Serpentín anticorrosión Blue Fin para ambiente marino costero.</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Wrench className="h-4 w-4 text-brand-cyan shrink-0" />
          <span>
            {selectedRegion === 'riviera_maya'
              ? 'Instalación y garantía en Cancún, Puerto Aventuras, Playa y Tulum.'
              : 'Instalación y garantía en San José del Cabo, Cabo San Lucas y La Paz.'}
          </span>
        </div>
      </div>

      {/* Price Area */}
      <div className="pt-3 border-t border-slate-800/80">
        <p className="text-[11px] text-slate-400 uppercase tracking-wider font-tech">
          {selectedRegion === 'riviera_maya' ? 'Precio Riviera Maya:' : 'Precio Los Cabos / BCS:'}
        </p>
        <p className="text-3xl sm:text-4xl font-black font-tech text-white mt-1 tracking-tight">
          ${priceMxn.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
        </p>
        <p className="text-[11px] text-slate-400 uppercase font-mono mt-0.5">
          IVA Incluido • Suministro directo
        </p>

        {/* Full-width CTA Button */}
        <div className="mt-4 w-full">
          <AcQuoteModal
            productId={productId}
            productTitle={productTitle}
            productModel={productModel}
            productBrand={productBrand}
            productImage={productImage}
            rawCostMxn={rawCostMxn}
            triggerText={isEn ? 'Request Quote & Installation' : 'Cotizar con Instalación'}
            triggerClassName="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-tech font-bold text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,163,255,0.35)] hover:shadow-[0_0_25px_rgba(0,163,255,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          />
        </div>
      </div>

      {/* Direct WhatsApp Callout with phone number on second line */}
      <div className="pt-3 border-t border-slate-800/60">
        <a
          href={
            selectedRegion === 'riviera_maya'
              ? `https://wa.me/5215528613165?text=${encodeURIComponent(`Hola, me interesa cotizar el minisplit AUFIT ${productModel} para entrega en Riviera Maya.`)}`
              : `https://wa.me/526246220525?text=${encodeURIComponent(`Hola, me interesa cotizar el minisplit AUFIT ${productModel} para entrega en Baja California Sur.`)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all group cursor-pointer text-center"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-tech font-bold uppercase tracking-wider">
            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>
              {selectedRegion === 'riviera_maya'
                ? 'Consultar Asesor Riviera Maya'
                : 'Consultar Asesor Los Cabos & BCS'}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {selectedRegion === 'riviera_maya' ? '+52 1 55 2861 3165' : '+52 624 622 0525'}
          </span>
        </a>
      </div>
    </div>
  );
}
