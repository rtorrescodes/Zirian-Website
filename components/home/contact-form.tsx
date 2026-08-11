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
                  {locale === 'en' ? 'Schedule a technical inspection visit without commitment for your residence or business in any area of Los Cabos.' : 'Agenda una visita de inspección técnica sin compromiso para tu residencia o negocio en cualquier zona de Los Cabos.'}
                </p>

                <div className="space-y-4">
                  <a
                    href="https://wa.me/526246220525"
                    target="_blank"
                    onClick={trackWhatsAppClick}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">{locale === 'en' ? 'Phone & WhatsApp' : 'Teléfono & WhatsApp'}</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">+52 624 622 0525</span>
                    </div>
                  </a>

                  <a
                    href="mailto:admin@alddea.com"
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-dark transition-colors group block"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded bg-brand-dark/10 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors mr-4">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-[9px] font-title uppercase tracking-widest text-gray-500 font-bold">{locale === 'en' ? 'Contact Email' : 'Correo de Contacto'}</span>
                      <span className="text-sm font-title font-extrabold text-brand-dark">admin@alddea.com</span>
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
                      <span className="text-sm font-title font-extrabold text-brand-dark">Los Cabos & La Paz, BCS, México</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-300 pt-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">{locale === 'en' ? 'Immediate Sales Support' : 'Atención Inmediata de Ventas'}</p>
                <a
                  href="https://wa.me/526246220525"
                  target="_blank"
                  onClick={trackWhatsAppClick}
                  className="inline-flex items-center bg-brand-green hover:bg-brand-greenDark text-brand-dark px-6 py-3.5 font-title uppercase tracking-widest text-xs font-black transition-all w-full sm:w-auto justify-center rounded shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.805-9.778.001-2.612-1.013-5.068-2.859-6.915C16.37 2.062 13.924.979 11.32.979 5.922.979 1.523 5.367 1.52 10.76c-.001 1.505.4 2.97 1.161 4.264l-.999 3.65 3.754-.984c1.238.675 2.58 1.026 3.911 1.028zm10.793-6.284c-.296-.147-1.748-.863-2.019-.961-.27-.099-.467-.147-.663.148-.196.295-.761.961-.933 1.158-.172.196-.344.22-.64.073-.296-.147-1.252-.461-2.385-1.471-.881-.786-1.476-1.756-1.649-2.05-.173-.296-.018-.456.13-.603.133-.132.296-.345.444-.517.149-.172.197-.295.296-.492.099-.197.05-.369-.024-.517-.075-.147-.663-1.598-.909-2.189-.239-.575-.483-.497-.663-.506-.172-.008-.368-.01-.565-.01-.196 0-.515.073-.784.369-.27.295-1.03 1.009-1.03 2.46 0 1.452 1.055 2.855 1.202 3.053.147.197 2.078 3.174 5.034 4.451.703.303 1.252.484 1.68.621.71.226 1.356.194 1.866.118.568-.084 1.748-.713 1.994-1.402.245-.689.245-1.279.172-1.402-.074-.123-.27-.197-.567-.345z" />
                  </svg>
                  {locale === 'en' ? 'WhatsApp Sales' : 'WhatsApp Ventas'}
                </a>
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
