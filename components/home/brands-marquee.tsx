"use client";
import React from 'react';

export function BrandsMarquee({ locale = 'es' }: { locale?: string }) {
  return (
    <section className="py-8 bg-[#0a0d14] border-b border-brand-border overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <span className="text-gray-500 font-title uppercase tracking-widest text-[9px] font-extrabold">{locale === 'en' ? 'CUTTING-EDGE TECHNOLOGY & INFRASTRUCTURE' : 'TECNOLOGÍA E INFRAESTRUCTURA DE VANGUARDIA'}</span>
      </div>
      <div className="relative w-full flex overflow-x-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0d14] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0d14] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="animate-marquee flex items-center space-x-16">
          <div className="flex items-center space-x-16">
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">TESLA</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-green">BYD</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-blue">JETOUR</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">GOOGLE</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CENTOS</span>
            <span className="text-white/45 font-title text-sm font-black tracking-widest">SAVANT</span>
            <span className="text-white/45 font-title text-sm font-black tracking-widest">LUTRON</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">UBIQUITI</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CISCO</span>
          </div>
          <div className="flex items-center space-x-16">
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">TESLA</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-green">BYD</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider text-brand-blue">JETOUR</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">GOOGLE</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CENTOS</span>
            <span className="text-white/45 font-title text-sm font-black tracking-widest">SAVANT</span>
            <span className="text-white/45 font-title text-sm font-black tracking-widest">LUTRON</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">UBIQUITI</span>
            <span className="text-white/45 font-title text-sm font-extrabold tracking-wider">CISCO</span>
          </div>
        </div>
      </div>
    </section>
  );
}
