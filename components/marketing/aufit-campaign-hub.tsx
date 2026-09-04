'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Download,
  Share2,
  ShieldAlert,
  Sparkles,
  Wind,
  Flame,
  VolumeX,
  FileDown,
  Maximize2,
  X,
  ChevronRight,
  MessageCircle,
  Info,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CopyItem {
  id: string;
  title: string;
  category: string;
  target: string;
  badgeColor: string;
  text: string;
  tip: string;
}

const whatsappCopies: CopyItem[] = [
  {
    id: 'residencial',
    title: 'Residencial / Familias (Chat 1 a 1)',
    category: 'Residencial',
    target: 'Clientes que buscan sustituir o instalar minisplits en casa',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    tip: 'Ideal para prospectos que cotizan por primera vez o que dudan de la marca frente a opciones baratas.',
    text: `¿Pensando en comprar el mismo minisplit de siempre? ❌

En zonas costeras como Riviera Maya y Los Cabos, los aires comunes sufren rápido por salinidad, humedad y calor abrasador. Terminan fallando en poco tiempo.

Descubre AUFIT: tecnología y confort superior para climas de costa:
🛡️ Serpentín Azul Anticorrosión (resistencia marina real)
❄️ Enfriamiento exprés en 30s (opera continuo hasta 55°C)
🤫 Ultra silencioso: sólo 23 dB (dormirás en paz total)
📱 WiFi integrado + Alexa y Google Home de fábrica
🌱 Ahorro Inverter con gas ecológico R32

No te conformes con lo común. Elige durabilidad e inteligencia.

📲 Contáctanos para cotización y catálogo:
🌐 www.zirian.com
📍 Entrega y garantía en Riviera Maya y Los Cabos`,
  },
  {
    id: 'airbnb',
    title: 'Airbnb, Hoteles Boutique & Rentas Vacacionales',
    category: 'Inversionistas',
    target: 'Dueños o administradores de propiedades turísticas',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    tip: 'Enfocado en el dolor principal del anfitrión: reseñas de 1 estrella por calor o ruido.',
    text: `Si tienes o administras propiedades en renta en Riviera Maya o Los Cabos: 🏖️

El 80% de las quejas y malas reseñas de huéspedes son por el aire acondicionado:
• Tarda una eternidad en enfriar
• Zumbidos molestos en la noche
• Olor a humedad acumulada

Con AUFIT blindas tu reputación:
1️⃣ Silencio absoluto de 23 dB para reseñas de 5 estrellas.
2️⃣ Auto-limpieza y esterilización térmica (cero moho ni olores).
3️⃣ Control remoto por WiFi / Alexa: préndelo antes del check-in y verifícalo al check-out.
4️⃣ Serpentín anticorrosión: adiós fugas provocadas por el salitre costero.

Cotiza hoy mismo para tus departamentos o villas:
🌐 www.zirian.com
📍 Respaldo y distribución directa en Riviera Maya y Los Cabos`,
  },
  {
    id: 'estados',
    title: 'Texto para Estados de WhatsApp & Historias',
    category: 'Redes / Estados',
    target: 'Contactos y prospectos que ven tus estados de WhatsApp diarios',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    tip: 'Copia este texto y pégalo como pie de foto al subir la Card Vertical 9:16.',
    text: `¿Vas a comprar aire acondicionado en Riviera Maya o Los Cabos? 🌊

No compres lo mismo que todos. 
AUFIT te da lo que otros no tienen:
🔹 Serpentín anticorrosión para ambiente marino
🔹 WiFi + Alexa de fábrica
🔹 Silencio total (23dB)
🔹 Enfría en 30 segundos y resiste hasta 55°C

Escríbenos para informes o visita www.zirian.com 📲`,
  },
  {
    id: 'contratistas',
    title: 'Arquitectos, Contratistas e Instaladores (B2B)',
    category: 'Profesional',
    target: 'Constructores, directores de obra y desarrolladores inmobiliarios',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    tip: 'Úsalo para cotizar proyectos en volumen, torres de condominios y residencias premium.',
    text: `Para tus desarrollos y proyectos en Riviera Maya y Los Cabos: 🏗️

Evita reclamos por corrosión prematura en minisplits. AUFIT (tecnología AUX) ofrece la mejor relación costo-beneficio de gama alta:
• Serpentín Blue Fin anticorrosión costera certificada.
• Compresión EVI con operación en calor extremo hasta 55°C.
• Gas ecológico R32 de alta eficiencia térmica.
• Aleta desmontable y conector rápido (reduce costo y tiempo de instalación a la mitad).
• Caja ignífuga 5VA para protección ante variaciones de voltaje.

Garantía y stock directo con ZIRIAN.

Pide tu catálogo para proyectos y precios de volumen:
🌐 www.zirian.com`,
  },
];

const infographics = [
  {
    id: 1,
    file: '/marketing/aufit/1.png',
    title: 'Presentación AUFIT Minisplit Inverter',
    desc: 'Línea de diseño moderno con alta eficiencia y tecnología de punta.',
  },
  {
    id: 2,
    file: '/marketing/aufit/2.png',
    title: 'Serpentín Blue Fin Anticorrosión',
    desc: 'Tratamiento hidrofílico especial para resistir salitre marino y humedad costera.',
  },
  {
    id: 3,
    file: '/marketing/aufit/3.png',
    title: 'Operación Continua hasta 55°C',
    desc: 'Compresión EVI de alta tecnología para soportar las olas de calor más severas.',
  },
  {
    id: 4,
    file: '/marketing/aufit/4.png',
    title: 'Conectividad WiFi + Alexa y Google',
    desc: 'Control remoto total desde la app móvil o comandos de voz sin módulos adicionales.',
  },
  {
    id: 5,
    file: '/marketing/aufit/5.png',
    title: 'Operación Ultra Silenciosa (23 dB)',
    desc: 'Diseño aerodinámico del ventilador y compresor amortiguado para descanso absoluto.',
  },
  {
    id: 6,
    file: '/marketing/aufit/6.png',
    title: 'Auto-Limpieza y Esterilización Térmica',
    desc: 'Ciclo a alta temperatura que erradica moho, bacterias y malos olores.',
  },
  {
    id: 7,
    file: '/marketing/aufit/7.png',
    title: 'Inverter Ecológico con Gas R32',
    desc: 'Ahorro sustancial en recibos de CFE y mínimo impacto ambiental.',
  },
];

export function AufitCampaignHub() {
  const [activeTab, setActiveTab] = useState<'copys' | 'cards' | 'infografias' | 'argumentario'>('copys');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Subheader */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-tech tracking-wider text-slate-400">
          <Link href="/admin/marketing" className="hover:text-brand-cyan transition-colors">
            MARKETING HUB
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-brand-cyan uppercase">CAMPAÑA AUFIT AIR CONDITIONING</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/marketing/aufit/brochure-aufit-minisplit.pdf"
            download
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-tech font-bold uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <FileDown className="w-4 h-4" />
            Descargar Brochure PDF
          </a>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-blue/10 p-6 md:p-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-tech font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Estrategia de Venta por Virtudes Tecnológicas (No por precio)
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            AUFIT: &ldquo;No compres lo mismo que todos: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">Exige ingeniería superior</span>&rdquo;
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            En plazas costeras como <strong className="text-white">Riviera Maya</strong> (Cancún, Playa del Carmen, Tulum) y <strong className="text-white">Los Cabos</strong>, los minisplits genéricos (Mirage y marcas comerciales) sufren de corrosión prematura por salitre y caídas graves de rendimiento en olas de calor. AUFIT está fabricado para resistir ambiente marino extremo y operar con silencio absoluto.
          </p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs font-tech text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              🛡️ Serpentín Azul Blue Fin
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              🔥 Operación hasta 55°C
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              🤫 23 dB Ultra Silencioso
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              📱 WiFi + Alexa y Google Home
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300">
              🌱 Gas Ecológico R32
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('copys')}
          className={`flex items-center gap-2 px-4 py-2.5 font-tech text-xs uppercase tracking-wider font-bold rounded-t-lg transition-all ${
            activeTab === 'copys'
              ? 'bg-brand-blue/15 text-brand-blue border-b-2 border-brand-blue shadow-[0_0_12px_rgba(0,163,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Guiones WhatsApp ({whatsappCopies.length})
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 font-tech text-xs uppercase tracking-wider font-bold rounded-t-lg transition-all ${
            activeTab === 'cards'
              ? 'bg-brand-blue/15 text-brand-blue border-b-2 border-brand-blue shadow-[0_0_12px_rgba(0,163,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Cards & Creativos (9:16 y 1:1)
        </button>
        <button
          onClick={() => setActiveTab('infografias')}
          className={`flex items-center gap-2 px-4 py-2.5 font-tech text-xs uppercase tracking-wider font-bold rounded-t-lg transition-all ${
            activeTab === 'infografias'
              ? 'bg-brand-blue/15 text-brand-blue border-b-2 border-brand-blue shadow-[0_0_12px_rgba(0,163,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          Galería Técnica & Fichas ({infographics.length + 1})
        </button>
        <button
          onClick={() => setActiveTab('argumentario')}
          className={`flex items-center gap-2 px-4 py-2.5 font-tech text-xs uppercase tracking-wider font-bold rounded-t-lg transition-all ${
            activeTab === 'argumentario'
              ? 'bg-brand-blue/15 text-brand-blue border-b-2 border-brand-blue shadow-[0_0_12px_rgba(0,163,255,0.2)]'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          AUFIT vs Competencia
        </button>
      </div>

      {/* TAB 1: GUIONES WHATSAPP */}
      {activeTab === 'copys' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wide">
                Guiones y Mensajes Listos para WhatsApp
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona el mensaje según tu prospecto. Puedes copiarlo al portapapeles o abrirlo directamente en WhatsApp.
              </p>
            </div>
            <span className="text-xs text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full font-tech">
              ⚡ 1-Click Share
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {whatsappCopies.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <Card
                  key={item.id}
                  className="flex flex-col justify-between border-slate-800 bg-slate-900/70 p-5 rounded-xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className={`text-[10px] font-tech font-bold uppercase tracking-wider ${item.badgeColor}`}>
                        {item.category}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.target}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {item.title}
                    </h3>

                    <div className="rounded-lg bg-slate-950/80 border border-slate-800/90 p-3.5 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-all">
                      {item.text}
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                      <Info className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
                      <span>{item.tip}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <Button
                      onClick={() => handleCopy(item.id, item.text)}
                      variant="outline"
                      size="sm"
                      className={`text-xs font-tech font-bold uppercase tracking-wider transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                          Copiar Texto
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleOpenWhatsApp(item.text)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Abrir WhatsApp
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CARDS & CREATIVOS */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wide">
              Cards Oficiales para WhatsApp & Redes
            </h2>
            <p className="text-xs text-slate-400">
              Material en alta resolución adaptado a los formatos más efectivos para captar clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Card 9:16 */}
            <Card className="border-slate-800 bg-slate-900/70 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-xs font-tech font-bold">
                    Formato Vertical 9:16
                  </Badge>
                  <span className="text-xs text-slate-300 font-semibold">Estados de WhatsApp & Stories</span>
                </div>
                <a
                  href="/marketing/aufit/Card_Aufit_WhatsApp_Status_9x16.jpg"
                  download="Card_Aufit_WhatsApp_Status_9x16.jpg"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 font-tech"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Descargar
                </a>
              </div>

              <div
                className="relative mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-2xl max-w-xs group cursor-pointer"
                onClick={() => setLightboxImage({ url: '/marketing/aufit/Card_Aufit_WhatsApp_Status_9x16.jpg', title: 'Card 9:16 para Estados de WhatsApp' })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/aufit/Card_Aufit_WhatsApp_Status_9x16.jpg"
                  alt="Card Aufit Estados 9:16"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded bg-black/70 text-white text-xs font-tech flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> Click para ampliar
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 text-xs space-y-1.5">
                <p className="font-semibold text-cyan-400 font-tech uppercase tracking-wide">
                  💡 ¿Cómo usar esta imagen?
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Súbela a tus <strong className="text-white">Estados de WhatsApp</strong> (y a tus historias de Instagram/Facebook). Acompáñala del <strong className="text-cyan-400">Guion C (Para Estados)</strong> y agrega el enlace a <span className="text-cyan-400">www.zirian.com</span>.
                </p>
              </div>
            </Card>

            {/* Card 1:1 */}
            <Card className="border-slate-800 bg-slate-900/70 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs font-tech font-bold">
                    Formato Cuadrado 1:1
                  </Badge>
                  <span className="text-xs text-slate-300 font-semibold">Chats 1 a 1, Grupos y Catálogo</span>
                </div>
                <a
                  href="/marketing/aufit/Card_Aufit_WhatsApp_Feed_1x1.jpg"
                  download="Card_Aufit_WhatsApp_Feed_1x1.jpg"
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center gap-1.5 font-tech"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  Descargar
                </a>
              </div>

              <div
                className="relative mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-2xl max-w-sm group cursor-pointer"
                onClick={() => setLightboxImage({ url: '/marketing/aufit/Card_Aufit_WhatsApp_Feed_1x1.jpg', title: 'Card 1:1 para Chat de WhatsApp y Catálogo' })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/aufit/Card_Aufit_WhatsApp_Feed_1x1.jpg"
                  alt="Card Aufit Feed 1:1"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded bg-black/70 text-white text-xs font-tech flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> Click para ampliar
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800 text-xs space-y-1.5">
                <p className="font-semibold text-amber-400 font-tech uppercase tracking-wide">
                  💡 ¿Cómo usar esta imagen?
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Envíala como imagen adjunta en chats 1 a 1 cuando un cliente te pida información general o pregunte si tienes marcas más económicas. La pregunta gancho <em>&ldquo;¿Pensando en comprar lo de siempre?&rdquo;</em> abre la conversación para vender AUFIT.
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: INFOGRAFÍAS Y FICHA TÉCNICA */}
      {activeTab === 'infografias' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wide">
                Láminas Oficiales de Características y Especificaciones
              </h2>
              <p className="text-xs text-slate-400">
                Haz clic en cualquier imagen para verla en pantalla completa o descárgala para incluirla en tus propuestas técnicas.
              </p>
            </div>
            <a
              href="/marketing/aufit/brochure-aufit-minisplit.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue hover:bg-brand-blue/80 text-white text-xs font-tech font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(0,163,255,0.3)]"
            >
              <FileDown className="w-4 h-4" />
              Descargar Catálogo Completo PDF (1 MB)
            </a>
          </div>

          {/* Ficha Técnica Destacada */}
          <Card className="border-slate-800 bg-slate-900/60 p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-full md:w-1/3 max-w-sm rounded-xl overflow-hidden border border-slate-700 cursor-pointer group relative"
                onClick={() => setLightboxImage({ url: '/marketing/aufit/Especificaciones Minisplit Aufit.png', title: 'Ficha Técnica Oficial Minisplit AUFIT' })}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/marketing/aufit/Especificaciones Minisplit Aufit.png"
                  alt="Especificaciones Minisplit Aufit"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded bg-black/80 text-white text-xs font-tech flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> Ampliar Ficha
                  </span>
                </div>
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-tech font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ficha Técnica Completa (1 a 2 Toneladas)
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Especificaciones Oficiales AUFIT Inverter SEER 20
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Incluye capacidades de enfriamiento en BTU (12,000, 18,000 y 24,000 BTU), voltajes (220V), consumo en Watts, dimensiones de unidad interior y exterior, nivel de ruido, tipo de refrigerante R32 y diámetros de tubería para los instaladores.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => setLightboxImage({ url: '/marketing/aufit/Especificaciones Minisplit Aufit.png', title: 'Ficha Técnica Oficial Minisplit AUFIT' })}
                    variant="outline"
                    size="sm"
                    className="font-tech text-xs uppercase tracking-wider border-slate-700 bg-slate-800/80 hover:bg-slate-800"
                  >
                    <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                    Examinar en Alta Resolución
                  </Button>
                  <a
                    href="/marketing/aufit/Especificaciones Minisplit Aufit.png"
                    download="Especificaciones_Minisplit_Aufit.png"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-tech font-bold uppercase tracking-wider text-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Descargar Ficha PNG
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Grid de 7 Láminas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infographics.map((info) => (
              <Card
                key={info.id}
                className="border-slate-800 bg-slate-900/60 p-4 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className="relative rounded-lg overflow-hidden border border-slate-800 cursor-pointer group bg-slate-950 aspect-[4/3] flex items-center justify-center"
                    onClick={() => setLightboxImage({ url: info.file, title: info.title })}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={info.file}
                      alt={info.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-tech flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" /> Ampliar
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-wide">
                      {info.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      {info.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-tech text-slate-500 uppercase">Lámina {info.id} de 7</span>
                  <a
                    href={info.file}
                    download={`Aufit_Lamina_${info.id}.png`}
                    className="text-[11px] text-brand-cyan hover:underline inline-flex items-center gap-1 font-tech uppercase font-bold"
                  >
                    <Download className="w-3 h-3" /> Descargar
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARGUMENTARIO VS COMPETENCIA */}
      {activeTab === 'argumentario' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-white font-tech uppercase tracking-wide">
              ¿Por qué AUFIT supera a Mirage y a la competencia?
            </h2>
            <p className="text-xs text-slate-400">
              Respuestas contundentes a las objeciones más frecuentes de clientes en zonas costeras.
            </p>
          </div>

          {/* Comparativa Table */}
          <Card className="border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-tech font-bold uppercase tracking-wider bg-slate-950/80">
                    <th className="py-3.5 px-4 text-slate-400">Característica Crítica</th>
                    <th className="py-3.5 px-4 text-emerald-400 bg-emerald-950/30 border-l border-r border-emerald-500/20">
                      AUFIT (Tecnología AUX) ⭐
                    </th>
                    <th className="py-3.5 px-4 text-slate-400">Equipos Comerciales (Mirage, etc.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      1. Resistencia al Salitre y Humedad Costera
                      <p className="text-[11px] font-normal text-slate-400">Clave para Riviera Maya y Los Cabos</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      Serpentín Azul Anticorrosión (Blue Fin)
                      <p className="text-[11px] font-normal text-emerald-400/80">Recubrimiento químico hidrofílico que no se oxida ni desmorona.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Serpentín de aluminio convencional que se pica y genera fugas de gas en 12 a 18 meses.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      2. Operación en Calor Extremo
                      <p className="text-[11px] font-normal text-slate-400">Veranos de 40°C a 45°C</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      Opera continuo hasta 55°C
                      <p className="text-[11px] font-normal text-emerald-400/80">Compresión EVI mantiene 90% de capacidad aun en olas de calor abrasador.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Entran en protección térmica o pierden más del 40% de su capacidad arriba de 40°C.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      3. Nivel de Ruido en Recámaras
                      <p className="text-[11px] font-normal text-slate-400">Descanso y rentas vacacionales / Airbnb</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      Ultra Silencioso: Sólo 23 dB
                      <p className="text-[11px] font-normal text-emerald-400/80">Tan silencioso como un susurro; ideal para recámaras de lujo.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      35 dB a 45 dB con zumbido nocturno continuo que provoca quejas de huéspedes.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      4. Conectividad Inteligente
                      <p className="text-[11px] font-normal text-slate-400">Control por voz y app móvil</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      WiFi Nativo + Alexa & Google Home de fábrica
                      <p className="text-[11px] font-normal text-emerald-400/80">Enciéndelo antes de llegar o regúlalo con comandos de voz.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Solo control remoto convencional; requieren comprar costosos módulos adicionales.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      5. Higiene y Olores por Humedad
                      <p className="text-[11px] font-normal text-slate-400">Salud respiratoria y moho</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      Auto-Limpieza & Esterilización Térmica
                      <p className="text-[11px] font-normal text-emerald-400/80">Ciclo térmico y filtros antibacteriales PM2.5 que evitan hongos.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Acumulación de humedad y olor desagradable que requiere desarmes y lavados frecuentes.
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-4 font-semibold text-white">
                      6. Eficiencia Energética y Refrigerante
                      <p className="text-[11px] font-normal text-slate-400">Recibo de luz de CFE</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-300 bg-emerald-950/20 border-l border-r border-emerald-500/20">
                      Gas R32 Ecológico + Inverter SEER 20
                      <p className="text-[11px] font-normal text-emerald-400/80">Hasta 60% de ahorro energético frente a modelos estándar.</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      Gas R410A saliente con eficiencias SEER 12 o 16 de mayor consumo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Los 4 Errores del Consumidor Costero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-red-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> 1. El Salitre Destruye lo Barato
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                El consumidor que ahorra $1,000 o $1,500 MXN en la compra inicial termina perdiendo todo el equipo al año y medio cuando el serpentín de aluminio se deshace con la brisa marina. AUFIT tiene protección Blue Fin para evitar esto.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-red-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4" /> 2. Olas de Calor y Compresores Pasados
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                En agosto y septiembre, cuando el termómetro roza los 44°C en Los Cabos o la humedad satura en Playa del Carmen, los minisplits comunes botan la pastilla térmica. AUFIT continúa operando hasta los 55°C.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-red-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <VolumeX className="w-4 h-4" /> 3. Malas Reseñas en Rentas Vacacionales
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Un huésped que paga $200 USD por noche en Riviera Maya no tolera un aire que suena como turbina de avión o que huele a humedad estancada. Con 23 dB y auto-limpieza térmica, AUFIT protege la calificación de 5 estrellas.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-red-400 font-tech uppercase tracking-wider flex items-center gap-1.5">
                <Wind className="w-4 h-4" /> 4. Soporte y Stock de Piezas Local
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                AUFIT cuenta con garantía directa, soporte de ingeniería y distribución oficial a través de ZIRIAN, evitando semanas de espera por refacciones que suelen ocurrir con marcas sin respaldo en zona.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white font-tech">{lightboxImage.title}</h4>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.url}
                  download
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-tech text-slate-200 rounded border border-slate-600 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5 text-brand-cyan" /> Descargar
                </a>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center max-h-[78vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
