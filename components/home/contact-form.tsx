'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const trackFormSubmit = (formId: string, leadType: string) => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "lead_submitted",
      form_id: formId,
      lead_type: leadType,
      submission_time: new Date().toISOString(),
    });
  }
};
const trackWhatsAppClick = () => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "whatsapp_click",
      source: "contact-form",
    });
  }
};

export function ContactForm({ locale = 'es' }: { locale?: string }) {
  
  const [contactForm, setContactForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    ubicacion: "",
    mensaje: "",
  });
  const [contactStatus, setContactStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus({ type: "loading", message: locale === 'en' ? "SENDING REGISTRATION..." : "ENVIANDO REGISTRO..." });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactForm,
          tipo_lead: "Contacto Directo",
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setContactStatus({
          type: "success",
          message: locale === 'en' ? `Done! ${resData.message}` : `¡Listo! ${resData.message}`,
        });
        setContactForm({
          nombre: "",
          telefono: "",
          email: "",
          ubicacion: "",
          mensaje: "",
        });
        trackFormSubmit("contact-form", "Contacto Directo");
      } else {
        setContactStatus({
          type: "error",
          message: resData.error || (locale === 'en' ? "Error saving data." : "Error al guardar los datos."),
        });
      }
    } catch (err) {
      setContactStatus({
        type: "error",
        message: locale === 'en' ? "Network error. Could not connect to the server." : "Error de red. No se pudo conectar con el servidor.",
      });
    }
  };


  return (
    <>
            <section id="contacto" className="py-20 lg:py-32 bg-premium-mesh-light text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="inline-block bg-brand-dark/10 border border-brand-dark/25 text-brand-dark font-title uppercase tracking-widest text-[10px] font-bold px-3.5 py-1.5 mb-3 rounded">
                  {locale === 'en' ? 'OFFICES AND PROJECTS' : 'OFICINAS Y PROYECTOS'}
                </span>
                <h2 className="font-title text-3xl lg:text-5xl font-extrabold text-brand-dark uppercase tracking-wide mt-1">
                  {locale === 'en' ? 'Ready to Start?' : '¿Listo para Empezar?'}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-brand-dark to-brand-green mt-4 mb-6" />
                <p className="text-gray-600 text-sm leading-relaxed mb-8">
                  {locale === 'en' 
                    ? 'Schedule a technical inspection visit without commitment for your residence or business in Los Cabos, La Paz or Riviera Maya.' 
                    : 'Agenda una visita de inspección técnica sin compromiso para tu residencia o negocio en Los Cabos, La Paz o Riviera Maya.'}
                </p>

                <div className="space-y-4">
                  {/* WhatsApp Riviera Maya */}
                  <a
                    href="https://wa.me/5215528613165?text=Hola%20Polo,%20me%20comunico%20desde%20la%20p%C3%A1gina%20web%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Riviera%20Maya."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick()}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mr-4 font-bold text-lg">
                      🌴
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-emerald-600 font-bold">
                        {locale === 'en' ? 'Riviera Maya (Cancún, Playa, Tulum)' : 'Riviera Maya (Cancún, Playa, Tulum)'}
                      </span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">+52 1 55 2861 3165</span>
                    </div>
                  </a>

                  {/* WhatsApp Los Cabos */}
                  <a
                    href="https://wa.me/526246220525?text=Hola,%20me%20comunico%20desde%20la%20p%C3%A1gina%20web%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Los%20Cabos%20/%20BCS."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick()}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors mr-4 font-bold text-lg">
                      🌵
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-cyan-600 font-bold">
                        {locale === 'en' ? 'Los Cabos & La Paz (BCS)' : 'Los Cabos & La Paz (BCS)'}
                      </span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">+52 624 622 0525</span>
                    </div>
                  </a>

                  <div className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group">
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">{locale === 'en' ? 'Coverage Areas' : 'Zonas de Cobertura'}</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">Los Cabos & La Paz, BCS | Riviera Maya, Q. Roo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-300 pt-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">{locale === 'en' ? 'Immediate Sales Support' : 'Atención Inmediata de Ventas'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/5215528613165?text=Hola%20Polo,%20me%20comunico%20desde%20la%20p%C3%A1gina%20web%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Riviera%20Maya."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackWhatsAppClick}
                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 font-title uppercase tracking-widest text-[11px] font-black transition-all justify-center rounded shadow-sm"
                  >
                    🌴 WhatsApp Riviera Maya
                  </a>
                  <a
                    href="https://wa.me/526246220525?text=Hola,%20me%20comunico%20desde%20la%20p%C3%A1gina%20web%20de%20Zirian%20para%20atenci%C3%B3n%20en%20Los%20Cabos%20/%20BCS."
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackWhatsAppClick}
                    className="inline-flex items-center bg-brand-green hover:bg-brand-greenDark text-brand-dark px-4 py-3 font-title uppercase tracking-widest text-[11px] font-black transition-all justify-center rounded shadow-sm"
                  >
                    🌵 WhatsApp Los Cabos
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-gray-200 p-8 sm:p-10 rounded-xl shadow-md">
              <h3 className="font-title text-xl font-bold uppercase text-brand-dark tracking-wide mb-6">{locale === 'en' ? 'Send us a Message' : 'Envíanos un Mensaje'}</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">{locale === 'en' ? 'Full Name *' : 'Nombre Completo *'}</label>
                  <input
                    type="text"
                    name="nombre"
                    value={contactForm.nombre}
                    onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                    required
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">{locale === 'en' ? 'Phone or Cellphone *' : 'Teléfono o Celular *'}</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={contactForm.telefono}
                      onChange={(e) => setContactForm({ ...contactForm, telefono: e.target.value })}
                      required
                      className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">{locale === 'en' ? 'Email Address' : 'Correo Electrónico'}</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">{locale === 'en' ? 'Villa, Subdivision or ZIP Code *' : 'Villa, Fraccionamiento o Código Postal *'}</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={contactForm.ubicacion}
                    onChange={(e) => setContactForm({ ...contactForm, ubicacion: e.target.value })}
                    required
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-title text-gray-500 font-bold mb-1.5">{locale === 'en' ? 'How can we help you? (Optional)' : '¿Cómo te podemos ayudar? (Opcional)'}</label>
                  <textarea
                    name="mensaje"
                    value={contactForm.mensaje}
                    onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-50/50 border border-gray-250 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark p-3 text-sm focus:outline-none rounded-lg transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-dark py-4 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {locale === 'en' ? 'Request Information' : 'Solicitar Información'}
                  </button>
                </div>
              </form>

              {contactStatus.type !== "idle" && (
                <div
                  className={`mt-6 p-4 rounded-xl text-xs font-title uppercase tracking-wider text-center ${
                    contactStatus.type === "loading"
                      ? "bg-gray-100 text-gray-700"
                      : contactStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-700"
                  }`}
                >
                  {contactStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      </>
  );
}
