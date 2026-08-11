'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const trackTicketSubmit = () => {
  if (typeof window !== "undefined") {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({
      event: "ticket_submitted",
      submission_time: new Date().toISOString(),
    });
  }
};


export function SupportTicket({ locale = 'es' }: { locale?: string }) {
  
  const [ticketForm, setTicketForm] = useState({
    nombre_cliente: "",
    folio_cliente: "",
    descripcion: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ticketStatus, setTicketStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus({ type: "loading", message: locale === 'en' ? "SUBMITTING SUPPORT TICKET..." : "ENVIANDO TICKET DE SOPORTE..." });

    try {
      const formData = new FormData();
      formData.append("nombre_cliente", ticketForm.nombre_cliente);
      formData.append("folio_cliente", ticketForm.folio_cliente);
      formData.append("descripcion", ticketForm.descripcion);

      if (fileInputRef.current && fileInputRef.current.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0]);
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setTicketStatus({
          type: "success",
          message: locale === 'en' ? `Ticket Opened! ${resData.message}` : `¡Ticket Abierto! ${resData.message}`,
        });
        setTicketForm({
          nombre_cliente: "",
          folio_cliente: "",
          descripcion: "",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        trackTicketSubmit();
      } else {
        setTicketStatus({
          type: "error",
          message: resData.error || (locale === 'en' ? "Error submitting report." : "Error al levantar el reporte."),
        });
      }
    } catch (err) {
      setTicketStatus({
        type: "error",
        message: locale === 'en' ? "Error uploading ticket. Check your file size." : "Error al subir el ticket. Compruebe el tamaño de su archivo.",
      });
    }
  };


  return (
    <>
            <section id="soporte" className="py-20 lg:py-32 bg-premium-mesh-dark border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-brand-blue font-title uppercase tracking-widest text-xs font-bold">{locale === 'en' ? 'WARRANTY PORTAL' : 'PORTAL DE GARANTÍAS'}</span>
            <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-wide mt-2">
              {locale === 'en' ? 'Technical Support and Reports' : 'Soporte Técnico y Reportes'}
            </h2>
            <div className="h-1 w-20 bg-brand-blue mx-auto mt-4" />
            <p className="text-gray-400 text-sm mt-3">
              {locale === 'en' ? 'Are you a Zirian client and have an issue? Submit a ticket and a technician will assist you.' : '¿Eres cliente de Zirian y tienes un reporte? Levanta un ticket y un técnico te atenderá.'}
            </p>
          </div>

          <div className="bg-brand-charcoal border border-brand-border p-6 sm:p-10 rounded-2xl shadow-2xl">
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Full Name *' : 'Nombre Completo *'}</label>
                  <input
                    type="text"
                    value={ticketForm.nombre_cliente}
                    onChange={(e) => setTicketForm({ ...ticketForm, nombre_cliente: e.target.value })}
                    required
                    placeholder={locale === 'en' ? "Your full name" : "Su nombre completo"}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Folio Number or ID (Optional)' : 'Número de Folio o ID (Opcional)'}</label>
                  <input
                    type="text"
                    value={ticketForm.folio_cliente}
                    onChange={(e) => setTicketForm({ ...ticketForm, folio_cliente: e.target.value })}
                    placeholder={locale === 'en' ? "Ex: ZIR-1049 (If you have one)" : "Ej: ZIR-1049 (Si cuenta con uno)"}
                    className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Description of the problem or request *' : 'Descripción del problema o requerimiento *'}</label>
                <textarea
                  value={ticketForm.descripcion}
                  onChange={(e) => setTicketForm({ ...ticketForm, descripcion: e.target.value })}
                  rows={5}
                  required
                  placeholder={locale === 'en' ? "Describe the issue in detail..." : "Describa el inconveniente a detalle..."}
                  className="w-full bg-brand-dark border border-brand-border focus:border-brand-blue text-white p-3 text-sm focus:outline-none rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-title text-gray-400 mb-2">{locale === 'en' ? 'Attach photographic evidence (Optional, max. 5MB, JPG/PNG)' : 'Adjuntar evidencia fotográfica (Opcional, máx. 5MB, JPG/PNG)'}</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="w-full bg-brand-charcoal border border-brand-border text-gray-300 text-xs p-3 rounded-lg"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-greenDark text-brand-dark py-4 font-title uppercase tracking-widest text-xs font-black transition-all rounded-lg cursor-pointer"
                >
                  {locale === 'en' ? 'Submit Support Ticket' : 'Levantar Ticket de Soporte'}
                </button>
              </div>
            </form>

            {ticketStatus.type !== "idle" && (
              <div
                className={`mt-6 p-4 rounded-xl text-xs font-title uppercase tracking-wider text-center ${
                  ticketStatus.type === "loading"
                    ? "bg-brand-blue/20 text-brand-blue"
                    : ticketStatus.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {ticketStatus.message}
              </div>
            )}
          </div>
        </div>
      </section>

      </>
  );
}
