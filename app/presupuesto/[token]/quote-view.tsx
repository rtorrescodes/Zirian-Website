"use client";

import { useState } from "react";
import { acceptQuote } from "@/app/actions/quotes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Download, ShieldCheck, Camera } from "lucide-react";
import Image from "next/image";

export function QuoteView({ quote, token }: { quote: any; token: string }) {
  const [isAccepting, setIsAccepting] = useState(false);
  const isApproved = quote.status === "Aprobado" || quote.status === "Ganada";

  let displayItems = [];
  if (quote.mostrar_desglose) {
    displayItems = quote.items.map((i: any) => ({
      qty: Number(i.cantidad),
      name: i.product?.nombre || 'Concepto',
      desc: i.descripcion || '',
      price: Number(i.precio_unitario),
      total: Number(i.total),
      unidad: i.product?.unidad_medida || 'pza'
    }));
  } else {
    const groups: Record<string, any> = {};
    quote.items.forEach((i: any) => {
      const groupName = i.product?.grupo_impresion || 'Instalación y Configuración';
      if (!groups[groupName]) {
        groups[groupName] = {
          qty: 1,
          name: groupName,
          desc: '',
          price: 0,
          total: 0,
          unidad: 'Servicio'
        };
      }
      if (i.descripcion && !groups[groupName].desc.includes(i.descripcion)) {
        groups[groupName].desc += (groups[groupName].desc ? ' • ' : '') + i.descripcion;
      }
      groups[groupName].price += Number(i.total);
      groups[groupName].total += Number(i.total);
    });
    displayItems = Object.values(groups);
  }

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await acceptQuote(token);
      alert("¡Presupuesto aceptado exitosamente! Nos pondremos en contacto contigo a la brevedad.");
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al aceptar el presupuesto.");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-slate-900/80">
        <div>
          <h1 className="font-tech text-2xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span className="text-brand-blue">ZIRIAN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Propuesta de Proyecto
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Folio</p>
          <p className="font-mono text-sm font-bold text-slate-300">
            COT-{new Date(quote.fecha_creacion).getFullYear()}-{String(quote.id).padStart(4, "0")}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Intro */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Hola, {quote.client.nombre.split(" ")[0]}
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Hemos preparado la siguiente propuesta técnica y comercial para tu proyecto. Por favor revísala y si estás de acuerdo, puedes aprobarla directamente en esta página.
          </p>
        </div>

        {/* Resumen Total */}
        <Card className="bg-gradient-to-br from-brand-blue/20 to-slate-900 border-brand-blue/30 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl"></div>
          <p className="text-sm font-tech font-bold text-brand-blue uppercase tracking-widest mb-1">
            Inversión Total
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl md:text-5xl font-mono font-bold text-white">
              ${Number(quote.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-slate-400 mb-2 font-bold">MXN</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            * Incluye IVA (${Number(quote.impuestos).toLocaleString("es-MX", { minimumFractionDigits: 2 })})
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isApproved ? (
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Presupuesto Aprobado
              </div>
            ) : (
              <Button
                onClick={handleAccept}
                disabled={isAccepting}
                className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-slate-950 shadow-lg shadow-brand-blue/20 h-12 text-lg font-bold"
              >
                {isAccepting ? "Procesando..." : "Aceptar Presupuesto"}
              </Button>
            )}
            
            <a 
              href={`/api/quotes/${quote.id}/pdf`}
              target="_blank"
              className="flex-none"
            >
              <Button variant="outline" className="w-full sm:w-auto h-12 bg-slate-900 border-slate-700 text-white hover:bg-slate-800">
                <Download className="w-5 h-5 mr-2" />
                Descargar PDF
              </Button>
            </a>
          </div>
        </Card>

        {/* Detalles del Proyecto */}
        <div className="space-y-4">
          <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2">
            Detalle de Inversión
          </h3>
          
          <div className="space-y-3">
            {displayItems.map((item: any, idx: number) => (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-white text-base leading-snug">
                    {item.name}
                  </p>
                  {item.desc && (
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2 font-tech uppercase tracking-wider">
                    Cant: {item.qty} {item.unidad}
                  </p>
                </div>
                <div className="text-left md:text-right pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/50">
                  <p className="font-mono font-bold text-emerald-400 text-lg">
                    ${item.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CCTV Preview si existe */}
        {quote.cctvProject?.previewImage && (
          <div className="space-y-4 mt-8">
            <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Diseño de Cobertura CCTV
            </h3>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {/* Usamos img de HTML regular porque el src es base64 y Next/Image se queja */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={quote.cctvProject.previewImage} 
                alt="Croquis CCTV" 
                className="w-full h-auto object-cover"
              />
              <div className="p-4 bg-slate-900 flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Detectar</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Observar</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Reconocer</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Identificar</div>
              </div>
            </div>
          </div>
        )}

        {/* Términos y Notas */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {(quote.condiciones || quote.terminos) && (
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
              <h4 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue border-b border-slate-800 pb-2">
                Condiciones Comerciales
              </h4>
              <div className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                {quote.condiciones && <p className="mb-2">{quote.condiciones}</p>}
                {quote.terminos && <p>{quote.terminos}</p>}
              </div>
            </div>
          )}
          
          {quote.notas_cliente && (
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl space-y-3">
              <h4 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-cyan border-b border-slate-800 pb-2">
                Notas Importantes
              </h4>
              <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                {quote.notas_cliente}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-8 text-center space-y-4">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-500">
            Esta cotización tiene una validez de {quote.validez_dias} días a partir de la fecha de emisión. Al aceptar este presupuesto, estás de acuerdo con los términos y condiciones de Zirian.
          </p>
        </div>

      </div>
    </div>
  );
}
