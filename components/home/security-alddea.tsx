'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';


export function SecurityAlddea({ locale = 'es' }: { locale?: string }) {
  

  return (
    <>
            <section id="alddea" className="py-20 lg:py-32 bg-premium-mesh-dark border-b border-brand-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px] px-6 sm:px-12">
              <div className="absolute w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl text-brand-blue" />
              <div className="absolute w-60 h-60 bg-brand-green/10 rounded-full blur-3xl -bottom-10 -left-10 text-brand-green" />
              
              {/* Left Phone (Guard App) */}
              <div className="absolute -left-2 sm:left-4 bottom-2 w-28 sm:w-36 rounded-2xl overflow-hidden border border-brand-border/80 shadow-2xl z-20 transform -rotate-4 transition-all duration-500 hover:rotate-0 hover:scale-105 bg-slate-950">
                <Image
                  src="/assets/images/alddea_guard.png"
                  alt="Alddea Seguridad QR"
                  width={144}
                  height={290}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Web Dashboard Layer */}
              <div className="relative w-full rounded-xl overflow-hidden border border-brand-border/60 shadow-2xl bg-brand-charcoal/90 transform -rotate-1.5 transition-all duration-500 hover:rotate-0 hover:scale-102 z-10 mx-6 sm:mx-12">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-brand-dark/85 border-b border-brand-border/50">
                  <div className="flex space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/70" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
                    <span className="w-2 h-2 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">alddea.com • Admin</span>
                </div>
                <Image
                  src="/assets/images/alddea_dashboard.png"
                  alt="Alddea Admin Dashboard"
                  width={500}
                  height={280}
                  className="w-full h-auto object-cover opacity-95"
                />
              </div>

              {/* Right Phone (Resident App) */}
              <div className="absolute -right-2 sm:right-4 -bottom-6 w-28 sm:w-36 rounded-2xl overflow-hidden border border-brand-border/80 shadow-2xl z-20 transform rotate-4 transition-all duration-500 hover:rotate-0 hover:scale-105 bg-slate-950">
                <Image
                  src="/assets/images/alddea_mobile.png"
                  alt="Alddea Resident App"
                  width={144}
                  height={290}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="inline-flex items-center space-x-2 border border-red-500/40 bg-red-500/10 text-red-400 font-title uppercase tracking-widest text-[10px] font-bold px-3 py-1.5 rounded mb-4 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>{locale === 'en' ? 'NEW LAUNCH • SOFTWARE' : 'NUEVO LANZAMIENTO • SOFTWARE'}</span>
              </span>
              <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-wide leading-tight">
                {locale === 'en' ? (
                  <>Manage your Community with <span className="text-brand-green">Alddea</span></>
                ) : (
                  <>Gestiona tu Fraccionamiento con <span className="text-brand-green">Alddea</span></>
                )}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-brand-blue to-brand-green mt-4 mb-6" />
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {locale === 'en' ? 'Alddea is the ultimate digital platform for managing high-end subdivisions, condominiums, and residential developments in Los Cabos and Riviera Maya. Automate operations and improve your residents\' experience from a single integrated system.' : 'Alddea es la plataforma digital definitiva para la administración de fraccionamientos, condominios y residenciales de alta gama en Los Cabos y Riviera Maya. Automatiza las operaciones y mejora la experiencia de tus residentes desde un solo sistema integrado.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {[
                  {
                    title: locale === 'en' ? "QR Access Control" : "Control de Accesos QR",
                    desc: locale === 'en' ? "Generation of digital visitor passes integrated into security booths." : "Generación de pases digitales para visitantes integrados a casetas de seguridad.",
                  },
                  {
                    title: locale === 'en' ? "Automated Finances" : "Finanzas Automatizadas",
                    desc: locale === 'en' ? "Collect maintenance fees, online payments and generate financial reports." : "Recauda cuotas de mantenimiento, pagos en línea y genera reportes financieros.",
                  },
                  {
                    title: locale === 'en' ? "Amenities Booking" : "Reservación de Amenidades",
                    desc: locale === 'en' ? "Scheduling for common areas, courts, clubhouse and residential services." : "Agenda para áreas comunes, canchas, casa club y servicios residenciales.",
                  },
                  {
                    title: locale === 'en' ? "Voting and Notices" : "Votaciones y Avisos",
                    desc: locale === 'en' ? "Virtual assemblies, massive surveys and direct newsletters to co-owners." : "Asambleas virtuales, encuestas masivas y boletín directo a copropietarios.",
                  },
                ].map((f, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="mt-1 bg-brand-blue/10 p-1.5 text-brand-blue rounded mr-3">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-title text-sm font-bold uppercase text-white tracking-wide">{f.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href="https://www.alddea.com"
                  target="_blank"
                  className="inline-flex items-center bg-brand-green hover:bg-brand-greenDark text-brand-dark px-8 py-4 font-title uppercase tracking-widest text-xs font-black transition-all duration-300 hover:scale-105 rounded-lg shadow-lg hover:shadow-brand-green/20"
                >
                  {locale === 'en' ? 'Discover Alddea.com' : 'Conoce Alddea.com'}
                  <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      </>
  );
}
