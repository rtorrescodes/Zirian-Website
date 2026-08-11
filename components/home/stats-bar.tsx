'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';


export function StatsBar({ locale = 'es' }: { locale?: string }) {
  

  return (
    <>
            <section className="bg-brand-charcoal py-8 border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-brand-green font-title font-extrabold text-lg sm:text-2xl tracking-wide">CFE</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">{locale === 'en' ? 'Official Standard' : 'Normativa Oficial'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-white font-title font-extrabold text-lg sm:text-2xl tracking-wide">NOM-001</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">{locale === 'en' ? 'Electrical Security' : 'Seguridad Eléctrica'}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 border-r border-brand-border/60 last:border-0">
              <span className="text-brand-blue font-title font-extrabold text-lg sm:text-2xl tracking-wide">{locale === 'en' ? '1 YEAR' : '1 AÑO'}</span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-title uppercase tracking-widest mt-1">{locale === 'en' ? 'Labor Warranty' : 'Garantía Mano de Obra'}</span>
            </div>
          </div>
        </div>
      </section>

      </>
  );
}
