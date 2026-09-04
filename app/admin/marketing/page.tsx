import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/panel/app-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Wind,
  Zap,
  Camera,
  Home,
  ArrowRight,
  FileDown,
  Sparkles,
  Share2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarketingHubPage() {
  const campaigns = [
    {
      id: 'aufit',
      title: 'AUFIT Minisplits Inverter',
      tagline: 'Climas de Alta Ingeniería para Ambiente Marino (Riviera Maya & Los Cabos)',
      status: 'active',
      badge: 'Campaña Activa',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: Wind,
      href: '/admin/marketing/aufit',
      stats: {
        copies: 4,
        images: 9,
        brochure: true,
      },
      description:
        'Material enfocado en ventas por virtudes técnicas (Serpentín Blue Fin anticorrosión, 55°C calor extremo, 23dB silencio absoluto, WiFi nativo y gas R32). Diseñado para ganar clientes que comparan por precio contra Mirage o marcas comerciales.',
      highlights: [
        '4 Guiones de WhatsApp (Residencial, Airbnb, Estados, Contratistas)',
        '2 Cards Oficiales de WhatsApp (Estados 9:16 y Chat 1:1)',
        '7 Infografías Técnicas Oficiales en Alta Resolución',
        'Ficha Técnica y Brochure en PDF Listo para Descargar',
      ],
      previewImage: '/marketing/aufit/Card_Aufit_WhatsApp_Feed_1x1.jpg',
    },
    {
      id: 'ev-chargers',
      title: 'Cargadores para Autos Eléctricos (EV)',
      tagline: 'Infraestructura de Carga Residencial y Comercial de Gama Alta',
      status: 'upcoming',
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Zap,
      href: '#',
      stats: {
        copies: 0,
        images: 0,
        brochure: false,
      },
      description:
        'Kits de prospección para hoteles, plazas comerciales y residencias de lujo. Fichas de cargadores Wallbox, Tesla y normatividad CFE.',
      highlights: [
        'Guiones para Administradores de Hoteles y Condominios',
        'Brochure Comercial Zirian EV Infrastructure',
        'Calculadora de retorno de inversión de carga',
      ],
    },
    {
      id: 'cctv-seguridad',
      title: 'CCTV & Seguridad con Inteligencia Artificial',
      tagline: 'Sistemas de Protección Perimetral y Monitoreo Empresarial',
      status: 'upcoming',
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Camera,
      href: '#',
      stats: {
        copies: 0,
        images: 0,
        brochure: false,
      },
      description:
        'Campañas dirigidas a desarrolladores y empresas. Fichas de cámaras con disuasión activa, visión nocturna ColorVu y analítica AcuSense.',
      highlights: [
        'Argumentario de Venta para Seguridad Residencial',
        'Comparativas de Tecnología IP vs Analógica',
        'Plantillas para cotizaciones corporativas',
      ],
    },
    {
      id: 'domotica',
      title: 'Automatización & Audio Premium',
      tagline: 'Smart Homes de Lujo y Sonorización Arquitectónica',
      status: 'upcoming',
      badge: 'Próximamente',
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: Home,
      href: '#',
      stats: {
        copies: 0,
        images: 0,
        brochure: false,
      },
      description:
        'Recursos comerciales para arquitectos e interioristas en Los Cabos y Riviera Maya. Integración con Lutron, Sonance y control por voz.',
      highlights: [
        'Guía de Experiencia Smart Home para Propietarios',
        'Muestrario de acabados y botoneras de lujo',
        'Fichas de integración de escenas e iluminación',
      ],
    },
  ];

  return (
    <AppShell
      title="Marketing Hub"
      subtitle="Recursos de ventas, campañas de WhatsApp, fichas técnicas y creativos gráficos para distribuidores autorizados."
    >
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
        {/* Hub Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-blue/15 p-6 md:p-8">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-brand-cyan/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/15 border border-brand-blue/30 text-brand-blue text-xs font-tech font-bold uppercase tracking-wider">
              <Megaphone className="w-3.5 h-3.5" />
              Kit Comercial para Distribuidores
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-tech uppercase tracking-wide">
              Centro de Marketing & Material de Venta
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Aquí encontrarás todo el material gráfico, copys redactados para WhatsApp y fichas técnicas para cerrar ventas más rápido. Selecciona una línea de producto para ver sus herramientas.
            </p>
          </div>
        </div>

        {/* Campaign List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wider">
                Líneas de Producto y Campañas
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona la campaña para acceder a copys y creativos descargables.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-tech">
              1 Activa • 3 en Preparación
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {campaigns.map((camp) => {
              const Icon = camp.icon;
              const isActive = camp.status === 'active';

              return (
                <Card
                  key={camp.id}
                  className={`border transition-all overflow-hidden rounded-2xl ${
                    isActive
                      ? 'border-brand-blue/40 bg-slate-900/90 shadow-[0_0_25px_rgba(0,163,255,0.1)] hover:border-brand-blue/70'
                      : 'border-slate-800/80 bg-slate-900/40 opacity-75'
                  }`}
                >
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                    {/* Left: Info */}
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isActive
                              ? 'bg-brand-blue/15 border-brand-blue/30 text-brand-cyan shadow-[0_0_12px_rgba(0,163,255,0.2)]'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white font-tech tracking-wide">
                              {camp.title}
                            </h3>
                            <Badge className={`text-[10px] font-tech font-bold uppercase tracking-wider ${camp.badgeColor}`}>
                              {camp.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-brand-cyan font-mono mt-0.5">
                            {camp.tagline}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                        {camp.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {camp.highlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? 'text-emerald-400' : 'text-slate-600'
                              }`}
                            />
                            <span className="truncate">{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {isActive && (
                        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-tech text-slate-400">
                          <span className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                            <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />
                            {camp.stats.copies} Guiones WhatsApp
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                            <Share2 className="w-3.5 h-3.5 text-amber-400" />
                            {camp.stats.images} Recursos Gráficos
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800 text-slate-300">
                            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                            Brochure PDF Incluido
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Action & Preview */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-64">
                      {isActive ? (
                        <>
                          <Link href={camp.href} className="w-full">
                            <Button className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-tech font-bold text-xs uppercase tracking-wider py-6 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,163,255,0.3)]">
                              <span>Entrar al Material AUFIT</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>

                          <a
                            href="/marketing/aufit/brochure-aufit-minisplit.pdf"
                            download
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-tech font-bold uppercase tracking-wider transition-colors"
                          >
                            <FileDown className="w-4 h-4 text-emerald-400" />
                            Descargar Brochure PDF
                          </a>
                        </>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                          <Clock className="w-5 h-5 text-slate-500 mx-auto" />
                          <p className="text-xs font-tech font-bold text-slate-400 uppercase">
                            En Creación
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Subiremos material pronto
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
