"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export function HomeFooter({ locale = 'es' }: { locale?: string }) {
  const [showWhatsAppModal, setShowWhatsAppModal] = React.useState(false);

  const trackWhatsAppClick = (region: string) => {
    if (typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: "whatsapp_click",
        region,
        click_time: new Date().toISOString(),
      });
    }
  };

  return (
    <>
      <footer className="bg-[#05070a] border-t border-brand-border py-12 text-gray-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2 lg:pr-8">
            <a href={`/${locale}#inicio`} className="inline-block">
              <Image
                src="/assets/images/logo.png"
                alt="Logo Zirian"
                width={160}
                height={44}
                className="h-8 w-auto object-contain"
                style={{ width: 'auto' }}
              />
            </a>
            <p className="mt-6 text-slate-400 text-sm leading-relaxed">
              {locale === 'en' 
                ? 'We are certified integrators specializing in electromobility, high-end residential automation, premium audio, air conditioning, and corporate network design. We transform your spaces with the most advanced, secure, and reliable technology on the market. Specialists in EV charger and minisplit installations in Los Cabos, Baja California Sur and Riviera Maya.' 
                : 'Somos integradores certificados especializados en electromovilidad, climatización de alta eficiencia, domótica residencial, audio premium y diseño de redes corporativas. Transformamos tus espacios con tecnología avanzada, segura y confiable. Especialistas en cargadores para autos eléctricos y minisplits en Los Cabos, Baja California Sur y Riviera Maya.'}
            </p>
            <p className="mt-6 text-sm uppercase tracking-widest text-slate-500 font-bold">
              © {new Date().getFullYear()} Zirian Engineering
            </p>
          </div>

          <div>
            <h4 className="font-title text-xs font-extrabold uppercase text-white tracking-widest mb-4">{locale === 'en' ? 'Solutions' : 'Soluciones'}</h4>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/#cargadores`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'EV Chargers' : 'Cargadores EV'}</Link></li>
              <li><Link href={`/${locale}/store?q=aufit`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'AUFIT AC Systems' : 'Aires AUFIT'}</Link></li>
              <li><Link href={`/${locale}/#servicios`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'Savant Smart Home' : 'Domótica Savant'}</Link></li>
              <li><Link href={`/${locale}/#servicios`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'Infrastructure & Networks' : 'Infraestructura y Redes'}</Link></li>
              <li><Link href={`/${locale}/#servicios`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'CCTV & Alerts' : 'CCTV y Alertas'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-title text-xs font-extrabold uppercase text-white tracking-widest mb-4">{locale === 'en' ? 'Quick Links' : 'Enlaces Rápidos'}</h4>
            <ul className="space-y-2">
              <li><Link href={`/${locale}/blog`} className="hover:text-brand-blue transition-colors">Blog</Link></li>
              <li><Link href={`/${locale}/store`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'Store' : 'Tienda'}</Link></li>
              <li><Link href={`/${locale}/#contacto`} className="hover:text-brand-blue transition-colors">{locale === 'en' ? 'Contact Us' : 'Contáctanos'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-title text-xs font-extrabold uppercase text-white tracking-widest mb-4">{locale === 'en' ? 'Locations' : 'Ubicaciones'}</h4>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[11px] text-brand-cyan">🌵 Baja California Sur</p>
                <p className="text-slate-400 mt-0.5">San José del Cabo, Cabo San Lucas, La Paz, Cabo del Este</p>
              </div>
              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">🌴 Riviera Maya</p>
                <p className="text-slate-400 mt-0.5">Cancún, Playa del Carmen, Tulum, Puerto Aventuras</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="inline-block border border-brand-border px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider">
                {locale === 'en' ? 'NOM / CFE Certified' : 'Certificados NOM / CFE'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button with Regional Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        {showWhatsAppModal && (
          <div className="absolute bottom-16 right-0 mb-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 text-left">
            <div className="border-b border-slate-800 pb-2">
              <p className="text-xs font-bold text-white font-title uppercase tracking-wider">
                {locale === 'en' ? 'Select your region:' : 'Selecciona tu zona:'}
              </p>
              <p className="text-[10px] text-slate-400">
                {locale === 'en' ? 'Direct engineer assistance via WhatsApp' : 'Atención técnica directa por WhatsApp'}
              </p>
            </div>

            <a
              href="https://wa.me/5215528613165?text=Hola%20Polo,%20me%20comunico%20desde%20la%20p%C3%A1gina%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Riviera%20Maya."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackWhatsAppClick('riviera_maya'); setShowWhatsAppModal(false); }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/30 border border-slate-700 hover:border-emerald-500/50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                🌴
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-white group-hover:text-emerald-300">
                  Riviera Maya
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  Cancún, Playa, Tulum, Puerto Aventuras
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono">
                  +52 1 55 2861 3165
                </span>
              </div>
            </a>

            <a
              href="https://wa.me/526246220525?text=Hola,%20me%20comunico%20desde%20la%20p%C3%A1gina%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Los%20Cabos%20/%20BCS."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { trackWhatsAppClick('los_cabos'); setShowWhatsAppModal(false); }}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-950/30 border border-slate-700 hover:border-cyan-500/50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                🌵
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-white group-hover:text-cyan-300">
                  Los Cabos & La Paz (BCS)
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  San José, Cabo San Lucas, La Paz
                </span>
                <span className="block text-[10px] text-cyan-400 font-mono">
                  +52 624 622 0525
                </span>
              </div>
            </a>
          </div>
        )}

        <button
          onClick={() => setShowWhatsAppModal(!showWhatsAppModal)}
          className="flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 relative"
          aria-label={locale === 'en' ? 'Contact via WhatsApp' : 'Contacto por WhatsApp'}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.47-1.761-1.643-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </button>
      </div>
    </>
  );
}
