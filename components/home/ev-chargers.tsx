'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';


export function EvChargers({ locale = 'es' }: { locale?: string }) {
  

  return (
    <>
            <section id="cargadores" className="py-20 lg:py-32 bg-premium-mesh-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">{locale === 'en' ? 'CHARGING INFRASTRUCTURE' : 'INFRAESTRUCTURA DE CARGA'}</span>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-wide mt-2">
              {locale === 'en' ? 'Electric Charger Specialists' : 'Especialistas en Cargadores Eléctricos'}
            </h2>
            <div className="h-1 w-20 bg-brand-blue mx-auto mt-4" />
            <p className="mt-4 text-gray-400">
              {locale === 'en' ? 'We guarantee safe and optimized electrical installations to protect your battery life and your home in Los Cabos.' : 'Garantizamos instalaciones eléctricas seguras y optimizadas para proteger la vida útil de tu batería y tu hogar en Los Cabos.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-title text-2xl lg:text-3xl font-extrabold text-white uppercase tracking-wide">
                {locale === 'en' ? 'Engineering Compatible with All Brands' : 'Ingeniería Compatible con Todas las Marcas'}
              </h3>
              <p className="mt-4 text-gray-400 leading-relaxed">
                {locale === 'en' ? 'We install EV chargers in residential homes, condominiums, hotels, and commercial parking lots. We connect the main standards and brands on the market:' : 'Instalamos cargadores EV en viviendas residenciales, condominios, hoteles y estacionamientos comerciales. Conectamos los principales estándares y marcas del mercado:'}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-8">
                {["Tesla", "BYD", "Jetour", "Geely", "Volvo", "BMW", "Porsche", "Audi", "Hyundai"].map((b) => (
                  <div key={b} className="bg-brand-charcoal border border-brand-border p-4 flex flex-col items-center justify-center rounded">
                    <span className={`font-title font-bold text-xs uppercase tracking-widest ${b === "BYD" || b === "Audi" ? "text-brand-green" : b === "Jetour" || b === "Geely" || b === "BMW" ? "text-brand-blue" : "text-white"}`}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-brand-charcoal border-l-4 border-brand-blue p-5">
                <h4 className="font-title text-sm font-bold uppercase text-white tracking-widest">{locale === 'en' ? 'Zirian Warranty Policies' : 'Políticas de Garantía Zirian'}</h4>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {locale === 'en' ? (
                    <>We offer a <strong>1-year warranty on labor</strong> performed by our certified engineers and a <strong>1-year warranty on supplies</strong> directly from our suppliers.</>
                  ) : (
                    <>Ofrecemos <strong>1 año de garantía en mano de obra</strong> realizada por nuestros ingenieros certificados y <strong>1 año de garantía en insumos</strong> directamente por parte de nuestros proveedores.</>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-brand-charcoal border border-brand-border p-8 relative overflow-hidden group rounded-xl">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-blue/20 transition-all" />

              <span className="text-xs text-brand-blue font-title font-bold uppercase tracking-widest">{locale === 'en' ? 'COMMERCIAL PROJECTS' : 'PROYECTOS COMERCIALES'}</span>
              <h3 className="font-title text-2xl font-extrabold text-white uppercase tracking-wide mt-2">
                {locale === 'en' ? 'Infrastructure for Hotels, Plazas and Airbnb' : 'Infraestructura para Hoteles, Plazas y Airbnb'}
              </h3>
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                {locale === 'en' ? 'Do you have a vacation rental property or commercial development in Los Cabos? Offering EV charging immediately increases your property visibility and value.' : '¿Tienes una propiedad en alquiler vacacional o un desarrollo comercial en Los Cabos? Ofrecer carga EV aumenta la visibilidad y valor de tu propiedad de forma inmediata.'}
              </p>

              <ul className="mt-6 space-y-3 text-xs text-gray-300">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {locale === 'en' ? 'Independent procedures and meters with CFE.' : 'Trámites y medidores independientes ante CFE.'}
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {locale === 'en' ? 'Smart charging systems and dynamic load distribution.' : 'Sistemas de carga inteligente y reparto de carga dinámica.'}
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-brand-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {locale === 'en' ? 'Preventive maintenance of substations and load centers.' : 'Mantenimiento preventivo de subestaciones y centros de carga.'}
                </li>
              </ul>

              <div className="mt-8">
                <a
                  href="#cotizador"
                  className="inline-block bg-brand-green hover:bg-brand-greenDark text-brand-dark px-6 py-3 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg"
                >
                  {locale === 'en' ? 'Qualify B2B Project' : 'Cualificar Proyecto B2B'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </>
  );
}
