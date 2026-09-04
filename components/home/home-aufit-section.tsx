'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ThermometerSnowflake,
  ShieldCheck,
  Zap,
  Wifi,
  Wind,
  Download,
  ArrowRight,
  Sparkles,
  Award,
  PhoneCall,
  MessageCircle,
} from 'lucide-react';

export function HomeAufitSection({ locale = 'es' }: { locale?: string }) {
  const isEn = locale === 'en';

  const trackWhatsApp = (region: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'whatsapp_click', {
        event_category: 'contact',
        event_label: `aufit_home_${region}`,
      });
    }
  };

  const features = [
    {
      title: isEn ? 'Blue Fin Marine Coating' : 'Serpentín Marino Blue Fin',
      desc: isEn
        ? 'Hydrophilic anticorrosion layer specially designed to withstand the harsh marine salt spray and coastal humidity of Los Cabos and Riviera Maya.'
        : 'Capa hidrofílica anticorrosiva diseñada especialmente para soportar el salitre marino y la humedad costera de Los Cabos y Riviera Maya.',
      badge: isEn ? 'Coastal Durability' : 'Anticorrosión Costera',
    },
    {
      title: isEn ? 'R32 Eco-Refrigerant' : 'Gas Ecológico R32',
      desc: isEn
        ? 'Next-gen refrigerant offering higher thermodynamic performance, zero ozone depletion, and 68% lower global warming potential than R410A.'
        : 'Refrigerante de última generación con mayor transferencia térmica, cero daño a la capa de ozono y 68% menor impacto ambiental que el R410A.',
      badge: isEn ? 'Higher Efficiency' : 'Máximo Rendimiento',
    },
    {
      title: isEn ? 'Full Inverter Savings (17-21 SEER)' : 'Ahorro Inverter (17 a 21 SEER)',
      desc: isEn
        ? 'Continuous DC inverter compressor modulation eliminates power spikes, reducing electricity bills by up to 60% under extreme temperatures up to 55°C.'
        : 'Compresor Full Inverter DC que modula la potencia de enfriamiento evitando picos de consumo, ahorrando hasta 60% de energía ante tarifas CFE.',
      badge: isEn ? 'Up to 60% Less Energy' : 'Ahorro CFE',
    },
    {
      title: isEn ? 'Smart Wi-Fi & 23 dB Silence' : 'Smart Wi-Fi y Silencio 23 dB',
      desc: isEn
        ? 'Pre-cool your home before arrival via mobile app, compatible with Alexa and Google Home. Whisper-quiet operation for bedrooms and offices.'
        : 'Control remoto total desde tu smartphone, compatible con Alexa y Google Home. Operación ultra silenciosa para máximo descanso.',
      badge: isEn ? 'Smart Living' : 'Hogar Inteligente',
    },
  ];

  return (
    <section id="climatizacion" className="py-20 lg:py-32 bg-premium-mesh-dark border-b border-brand-border overflow-hidden relative scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-cyan-400 font-title uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {isEn ? 'HIGH-EFFICIENCY AIR CONDITIONING' : 'ALTA INGENIERÍA EN CLIMATIZACIÓN'}
          </span>
          <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white uppercase tracking-wide mt-2">
            {isEn ? (
              <>AUFIT Inverter Mini-Splits for <span className="text-cyan-400">Extreme Coastal Climates</span></>
            ) : (
              <>Minisplits Inverter AUFIT para <span className="text-cyan-400">Clima Costero Extremo</span></>
            )}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto mt-4" />
          <p className="mt-4 text-gray-400 text-sm sm:text-base leading-relaxed">
            {isEn
              ? 'Engineered to withstand temperatures up to 55°C and marine corrosion in Los Cabos, La Paz, and Riviera Maya (Cancún, Playa del Carmen, Tulum). Full inverter technology with certified regional warranty.'
              : 'Diseñados para operar a temperaturas extremas de hasta 55°C y resistir el salitre en Los Cabos, La Paz y la Riviera Maya (Cancún, Playa del Carmen, Tulum). Suministro, cotización personalizada e instalación profesional.'}
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Product Visual Mockups */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[420px] px-4">
            <div className="absolute w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
            <div className="absolute w-56 h-56 bg-blue-600/15 rounded-full blur-3xl -bottom-8 -left-8" />
            
            {/* Main Visual: Feed Card Mockup */}
            <div className="relative w-full max-w-[380px] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] bg-slate-950 transform -rotate-1 hover:rotate-0 hover:scale-102 transition-all duration-500 z-10">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                    AUFIT Inverter • Blue Fin
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">R32 Eco</span>
              </div>
              <Image
                src="/marketing/aufit/Card_Aufit_WhatsApp_Feed_1x1.jpg"
                alt="AUFIT Minisplit Inverter Clima Costero"
                width={400}
                height={400}
                priority
                unoptimized
                className="w-full h-auto object-cover"
              />
              <div className="p-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">1.0 a 3.0 Toneladas</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Solo Frío & Frío/Calor • 220V</div>
                </div>
                <Link
                  href={`/${locale}/store?q=AUFIT`}
                  className="py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{isEn ? 'Quote' : 'Cotizar'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Overlapping Badge: Official Brochure Download */}
            <div className="absolute -bottom-4 right-2 sm:right-6 bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md z-20 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <a
                  href="/marketing/aufit/brochure-aufit-minisplit.pdf"
                  download="Brochure_AUFIT_Minisplit_Zirian.pdf"
                  className="text-xs font-mono font-bold text-cyan-300 hover:text-cyan-200 uppercase tracking-wider block"
                >
                  {isEn ? 'Download Catalog' : 'Ficha Técnica PDF'}
                </a>
                <span className="text-[9px] text-slate-400 font-mono block">Especificaciones Oficiales</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Benefits & Action Links */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                      {feat.badge}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-title text-base font-bold text-white uppercase tracking-wider mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Direct Regional Actions Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider mb-1">
                  {isEn ? 'Fast Direct Quotation & Installation' : 'Cotización Rápida con Instalación'}
                </div>
                <p className="text-xs text-slate-300">
                  {isEn
                    ? 'Request customized pricing for residences, villas, or commercial lots.'
                    : 'Cotiza equipos para tu residencia, villa o desarrollo vacacional.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <Link
                  href={`/${locale}/store?q=AUFIT`}
                  className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg transition-all text-center"
                >
                  {isEn ? 'View Store Catalog' : 'Ver en Tienda'}
                </Link>

                <a
                  href="https://wa.me/5215528613165?text=Hola%2C+me+gustar%C3%ADa+cotizar+aires+acondicionados+AUFIT+para+la+Riviera+Maya"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsApp('riviera_maya')}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  title="Contactar asesor Riviera Maya"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>Riviera Maya</span>
                </a>

                <a
                  href="https://wa.me/526246220525?text=Hola%2C+me+gustar%C3%ADa+cotizar+aires+acondicionados+AUFIT+para+Baja+California+Sur"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsApp('los_cabos')}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  title="Contactar asesor Los Cabos"
                >
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span>Los Cabos</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
