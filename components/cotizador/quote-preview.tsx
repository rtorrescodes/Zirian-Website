'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface QuotePreviewProps {
  template: string;
  selectedClient: any;
  items: any[];
  requiereFactura: boolean;
  notasCliente: string;
  subtotal: number;
  iva: number;
  total: number;
  moneda?: string;
  impuestosIniciales?: number;
  attachments?: any[];
  mostrarDesglose?: boolean;
  groupPrices?: Record<string, number>;
  secciones?: string[];
}

export function QuotePreview({
  template,
  selectedClient,
  items,
  secciones = [],
  requiereFactura,
  notasCliente,
  subtotal,
  iva,
  total,
  moneda = 'MXN',
  impuestosIniciales = 0,
  mostrarDesglose = false,
  groupPrices = {},
  attachments = [],
}: QuotePreviewProps) {
  const isEn = template === 'ev_charger_en';
  const isGeneral = template === 'general';

  // Group items logic
  let displayItems: any[] = [];
  if (mostrarDesglose) {
    const hasSections = items.some((i: any) => i.seccion);
    
    if (hasSections) {
      const sectionMap: Record<string, any[]> = {};
      items.forEach((i: any) => {
        const sec = i.seccion || 'General';
        if (!sectionMap[sec]) sectionMap[sec] = [];
        sectionMap[sec].push(i);
      });
      
      const orderedSections = [...secciones, 'General'];
      const processedSections = new Set<string>();
      
      orderedSections.forEach(sec => {
        if (sectionMap[sec] && sectionMap[sec].length > 0 && !processedSections.has(sec)) {
          processedSections.add(sec);
          displayItems.push({
            isSectionHeader: true,
            product: { nombre: sec },
            qty: '',
            detalles: ''
          });
          displayItems.push(...sectionMap[sec]);
        }
      });
      
      // Añadir cualquier sección que no estuviera en la lista `secciones` por alguna razón
      Object.keys(sectionMap).forEach(sec => {
        if (!processedSections.has(sec)) {
          displayItems.push({
            isSectionHeader: true,
            product: { nombre: sec },
            qty: '',
            detalles: ''
          });
          displayItems.push(...sectionMap[sec]);
        }
      });
    } else {
      displayItems = items;
    }
  } else {
    const groups: Record<string, any> = {};
    
    // Find cable meters for Instalación de Cargador EV
    let cableMetros = 0;
    items.forEach((i: any) => {
      const name = (i.product?.nombre || i.detalles || '').toLowerCase();
      if (name.includes('cable')) {
        cableMetros = Math.max(cableMetros, Number(i.qty));
      }
    });

    items.forEach((i: any) => {
      const groupName = i.product?.grupo_impresion || 'Concepto General';
      
      // Initialize if missing
      if (!groups[groupName]) {
        groups[groupName] = {
          qty: 1,
          product: {
            nombre: groupName,
            precio_base: groupPrices[groupName] !== undefined ? groupPrices[groupName] : 0
          },
          detalles: '',
          isGroup: true
        };
      }
      
      // Concatenate descriptions
      if (groupName === 'Instalación de Cargador EV') {
        groups[groupName].detalles = `(Incluye materiales, instalación a ${cableMetros} metros)`;
      } else {
        if (i.detalles && !groups[groupName].detalles.includes(i.detalles)) {
          groups[groupName].detalles += (groups[groupName].detalles ? ' • ' : '') + i.detalles;
        } else if (i.product?.descripcion && !groups[groupName].detalles.includes(i.product.descripcion)) {
          groups[groupName].detalles += (groups[groupName].detalles ? ' • ' : '') + i.product.descripcion;
        }
      }
      
      // Sum prices ONLY IF there is no custom groupPrice override for this group
      if (groupPrices[groupName] === undefined) {
        const itemTotal = Number(i.product.precio_base) * i.qty;
        groups[groupName].product.precio_base += itemTotal;
      }
    });
    displayItems = Object.values(groups);
  }

  return (
    <div className="mx-auto mt-10 max-w-7xl">
      <Card className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-tech text-sm font-bold uppercase tracking-widest text-brand-blue">
            Previsualización en Vivo del Documento
          </h3>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-tech uppercase tracking-wider">
            Tiempo Real
          </Badge>
        </div>
        <div className="bg-slate-50 md:bg-slate-900 py-4 px-0 md:p-8 rounded-xl flex justify-center shadow-inner overflow-hidden w-full">
          <div className="flex flex-col gap-8 w-full md:w-auto overflow-hidden md:overflow-visible">
            {(() => {
              const isEn = template === 'ev_charger_en';
              const isGeneral = template === 'general';
              return (
              <div className="w-[340px] h-[500px] sm:w-[510px] sm:h-[730px] md:w-auto md:h-auto mx-auto overflow-hidden">
                <div className="w-[850px] min-h-[1202px] bg-white md:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] font-sans relative shrink-0 scale-[0.4] sm:scale-[0.6] md:scale-100 origin-top-left transition-all text-[#1F2937] flex flex-col">
                
                {/* Header (Top) */}
                <div className="flex justify-between items-start px-12 pt-12 pb-6">
                  <div className="max-w-[400px]">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/logo-zirian-cotizador.png" alt="Zirian Logo" className="h-12 w-auto" />
                    </div>
                    <h2 className="text-[#1C497B] font-bold text-lg leading-tight mb-2">Energía y sistemas, donde necesites</h2>
                    <p className="text-sm text-slate-500 mb-1 leading-snug">San José del Cabo, Baja California Sur</p>
                    <p className="text-sm text-slate-500 leading-snug">WhatsApp: (624) 6220525 | www.zirian.com</p>
                  </div>

                  <div className="text-right">
                    <h1 className="text-3xl font-black text-[#1C497B] tracking-wider mb-2 uppercase">{isEn ? 'Quote' : 'Cotización'}</h1>
                    <p className="text-slate-400 font-mono text-sm"># DRAFT</p>
                  </div>
                </div>

                {/* Info Blocks */}
                <div className="flex px-12 mb-4 gap-0 border-t border-slate-300">
                  <div className="flex-1">
                    <div className="bg-[#1C497B] text-white font-bold text-[10px] px-2 py-1 uppercase tracking-wider">{isEn ? 'Client' : 'Cliente'}</div>
                    <div className="p-2 text-xs">
                      <p className="font-bold text-[13px] mb-0.5">{selectedClient?.nombre || "[Nombre del Cliente]"}</p>
                      {selectedClient?.empresa && <p className="text-slate-700">{selectedClient.empresa}</p>}
                      <p className="text-slate-700">{selectedClient?.ubicacion || "[Dirección / Ubicación]"}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-[#1C497B] text-white font-bold text-[10px] px-2 py-1 uppercase tracking-wider">{isEn ? 'Emission Details' : 'Detalles de Emisión'}</div>
                    <div className="p-2 text-xs flex flex-col gap-1 border-l border-slate-300 h-[calc(100%-24px)]">
                      <p><span className="font-bold">{isEn ? 'Date:' : 'Fecha:'}</span> {new Date().toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      <p><span className="font-bold">{isEn ? 'Valid until:' : 'Validez:'}</span> {new Date(Date.now() + 15 * 86400000).toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      <p className="mb-0.5"><span className="font-bold">Agente:</span> Ing. Rodrigo Torres</p>
                    </div>
                  </div>
                </div>

                {/* Intro Text */}
                <div className="px-12 mb-3">
                  <p className="text-xs text-slate-700 mb-1">{isEn ? 'Dear Client:' : 'Estimado/a cliente:'}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {isEn 
                      ? 'It is a pleasure to present our technical proposal for the integration of your ecosystem. At Zirian México, we prioritize regulatory safety and energy efficiency.'
                      : <>Es un gusto presentarle nuestra propuesta técnica para la integración de su ecosistema. En <strong>Zirian México</strong>, priorizamos la seguridad normativa y la eficiencia energética.</>}
                  </p>
                </div>

                {/* Green/Teal Banner */}
                <div className="mx-12 mb-1 bg-[#25B150] text-white text-[10px] font-bold text-center py-1 uppercase tracking-wider">
                  {isGeneral
                    ? 'Alta Ingeniería Eléctrica / Automatización / Videovigilancia / Redes / Sistemas'
                    : isEn
                      ? 'EV Chargers / Solar Panels / Automatic Sprinklers / Air Conditioners / Electric Gates / Internet Networks / Systems'
                      : 'Cargadores EV / Paneles Solares / Riego automático / Aires Acondicionados / Portones Eléctricos / Redes Internet / Sistemas'}
                </div>

                {/* Table */}
                <div className="px-12 mb-4">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#1C497B] text-white">
                      <tr>
                        <th className="py-2 px-2 border border-slate-300 w-12 text-center">{isEn ? 'Qty' : 'Cant'}</th>
                        <th className="py-2 px-2 border border-slate-300 w-48">{isEn ? 'Product' : 'Producto'}</th>
                        <th className="py-2 px-2 border border-slate-300">{isEn ? 'Description' : 'Descripción'}</th>
                        <th className="py-2 px-2 border border-slate-300 w-24 text-right">{isEn ? 'Price' : 'Precio'}</th>
                        <th className="py-2 px-2 border border-slate-300 w-12 text-center">{isEn ? 'Tax' : 'IVA'}</th>
                        <th className="py-2 px-2 border border-slate-300 w-24 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {displayItems.length === 0 ? (
                        <tr><td colSpan={8} className="py-8 text-center text-slate-400 italic">Agrega conceptos a la cotización</td></tr>
                      ) : displayItems.map((item, idx) => {
                        if (item.isSectionHeader) {
                          return (
                            <tr key={`sec-${idx}`}>
                              <td colSpan={6} className="py-1 px-2 border border-slate-300 bg-slate-200 font-bold text-slate-900 text-[10px] uppercase tracking-wider">
                                {item.product.nombre}
                              </td>
                            </tr>
                          );
                        }
                        
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="py-2 px-2 border border-slate-300 text-center font-bold">{item.qty}</td>
                            <td className="py-2 px-2 border border-slate-300">
                               <div className="font-bold text-slate-900">{item.product.nombre}</div>
                            </td>
                            <td className="py-2 px-2 border border-slate-300 text-slate-600 text-[10px] whitespace-pre-wrap leading-tight">
                               {item.detalles || (!item.isGroup && item.product?.descripcion) || ''}
                            </td>
                            <td className="py-2 px-2 border border-slate-300 text-right">${Number(item.product.precio_base).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                            <td className="py-2 px-2 border border-slate-300 text-center">{(requiereFactura || impuestosIniciales > 0) ? '16%' : '0%'}</td>
                            <td className="py-2 px-2 border border-slate-300 text-right font-bold bg-slate-100">${(Number(item.product.precio_base) * item.qty * ((requiereFactura || impuestosIniciales > 0) ? 1.16 : 1)).toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Totals Box */}
                  <div className="flex mt-1">
                    <div className="w-1/2 p-2">
                      <p className="text-xs font-bold text-slate-800">{isEn ? 'Technical Note:' : 'Nota Técnica:'}</p>
                      {notasCliente && <p className="text-[10px] text-slate-600 mt-1">{notasCliente}</p>}
                    </div>
                    <div className="w-1/2">
                      <table className="w-full text-xs text-right">
                        <tbody>
                          <tr>
                            <td className="py-1 px-2 font-bold w-1/2">Subtotal</td>
                            <td className="py-1 px-2">${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          </tr>
                          <tr>
                            <td className="py-1 px-2 font-bold">{isEn ? 'Tax (16%)' : 'I.V.A. (16%)'}</td>
                            <td className="py-1 px-2">${iva.toLocaleString('es-MX', {minimumFractionDigits: 2})}</td>
                          </tr>
                          <tr className="text-lg text-[#1C497B]">
                            <td className="py-2 px-2 font-black uppercase tracking-wider">Total</td>
                            <td className="py-2 px-2 font-black">${total.toLocaleString('es-MX', {minimumFractionDigits: 2})} {moneda || 'MXN'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Spacer to push everything below to the bottom */}
                <div className="flex-grow min-h-[20px]"></div>

                                {/* Compromiso Zirian Section */}
                {!isGeneral && (
                  <div className="px-12 pt-3 mb-1">
                    <h3 className="text-[#1C497B] font-bold text-sm uppercase tracking-wider">{isEn ? 'Zirian Commitment' : 'Compromiso Zirian'}</h3>
                  </div>
                )}
                <div className="px-12 mb-1">
                  <div className="w-full border-t border-black pt-1">
                    {!isGeneral && (
                      <>
                        <p className="text-[10px] italic text-slate-600 mb-2">
                          {isEn
                            ? '"We guarantee leading infrastructure compatible with BYD, operating under the strictest safety and regulatory standards in BCS."'
                            : '"Garantizamos infraestructura líder y compatible con BYD, operando bajo los más estrictos estándares normativos de seguridad en BCS."'
                          }
                        </p>
                        <p className="text-xs font-bold text-[#1C497B]">{isEn ? 'Zirian México Team' : 'Equipo Zirian México'}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Strip Section */}
                {!isGeneral && (
                  <div className="px-12 mt-2 mb-1">
                    <p className="text-[10px] font-bold text-[#1C497B] mb-1 text-center">{isEn ? 'Thank you for your trust' : 'Gracias por su confianza'}</p>
                    <div className="w-full h-[70px]">
                      <img src="/instalaciones-strip.jpg" alt="Instalaciones Zirian" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Green Banner */}
                {!isGeneral && (
                  <div className="px-12 mb-2">
                    <div className="bg-[#25B150] text-white text-[9px] font-bold text-center py-1 w-full px-2">
                      {isEn
                        ? <>MAINTAIN YOUR BYD WARRANTY: We hold the EC1641 EV Charger Installation certification backed by CFE and<br/>strictly comply with the NOM-001-SEDE-2012 Electrical Installations standard.</>
                        : <>MANTENGA SU GARANTÍA BYD: Contamos con certificación EC1641 Instalación de Cargadores EV avalada por la CFE y<br/>cumplimiento estricto de la NOM-001-SEDE-2012 de Instalaciones Eléctricas.</>}
                    </div>
                  </div>
                )}

                {/* Terms and conditions */}
                <div className="px-12 flex gap-4 text-[8px] leading-tight opacity-90 text-slate-500 mb-2">
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="font-bold mb-0.5">{isEn ? '1. SCOPE OF OFFER' : '1. ALCANCE DE LA OFERTA'}</p>
                      <p>{isGeneral
                        ? (isEn ? 'This proposal includes exclusively the described items. Any additional equipment or work not included will be quoted separately.' : 'Esta propuesta incluye exclusivamente los conceptos descritos. Cualquier requerimiento, equipo o trabajo adicional no contemplado será cotizado por separado.')
                        : (isEn ? 'This proposal includes exclusively the described items. Any additional requirement, material, or work not included will be quoted separately.' : 'Esta propuesta incluye exclusivamente los conceptos descritos. Cualquier requerimiento, material o trabajo adicional no contemplado será cotizado por separado.')
                      }</p>
                    </div>
                    <div>
                      <p className="font-bold mb-0.5">{isEn ? '2. WARRANTY & COVERAGE' : '2. GARANTÍA Y COBERTURA'}</p>
                      <p>{isGeneral
                        ? (isEn ? 'Warranty applies to equipment supplied/installed by Zirian. Excludes damage caused by misuse, third parties, voltage fluctuations or natural disasters.' : 'Garantía sobre equipos suministrados y/o instalados por Zirian. Quedan excluidos daños por uso indebido, terceros, variaciones de voltaje o desastres naturales.')
                        : (isEn ? 'Warranty applies to equipment installed by Zirian. Excludes damage caused by misuse, voltage fluctuations, third parties, or natural phenomena.' : 'Garantía sobre equipos instalados por Zirian. Quedan excluidos daños por uso indebido, variaciones de voltaje, terceros o fenómenos naturales.')
                      }</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="font-bold mb-0.5">{isEn ? '3. CLIENT RESPONSIBILITY' : '3. RESPONSABILIDAD DEL CLIENTE'}</p>
                      <p>{isGeneral
                        ? (isEn ? 'The client must provide site access and have the necessary prior conditions for the correct execution of the project.' : 'El cliente deberá proporcionar las facilidades de acceso al sitio y contar con las adecuaciones previas necesarias para la correcta ejecución del proyecto.')
                        : (isEn ? 'The client must guarantee free access to the site and is responsible for processing any necessary permits (CFE/municipality) unless otherwise agreed.' : 'El cliente deberá garantizar el libre acceso al sitio y será responsable de tramitar los permisos necesarios (CFE/municipio) salvo acuerdo previo.')
                      }</p>
                    </div>
                    <div>
                      <p className="font-bold mb-0.5">{isEn ? '4. TECHNICAL SUPPORT' : '4. SOPORTE TÉCNICO'}</p>
                      <p>{isGeneral
                        ? (isEn ? 'Remote technical assistance. On-site diagnostic visits are subject to availability and may generate travel expenses outside the local area.' : 'Asistencia técnica remota. Las visitas presenciales de diagnóstico están sujetas a disponibilidad y podrán generar costos de viáticos fuera del área local.')
                        : (isEn ? 'Remote assistance for troubleshooting. On-site visits are subject to availability (travel expenses apply outside BCS).' : 'Asistencia remota para diagnóstico de fallas. Las visitas presenciales están sujetas a disponibilidad (viáticos aplicables fuera de BCS).')
                      }</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-3">
                    <div>
                      <p className="font-bold mb-0.5">{isEn ? '5. VALIDITY & PAYMENT TERMS' : '5. VALIDEZ Y CONDICIONES DE PAGO'}</p>
                      <p>{isGeneral
                        ? (isEn ? 'Quote valid for 15 days (subject to inventory). Requires advance payment for order processing and balance against delivery.' : 'Cotización válida por 15 días (o sujeto a disponibilidad de inventario). Requiere anticipo para procesar pedido y saldo contra entrega.')
                        : (isEn ? 'Quote valid for 30 days. Requires an advance payment to start and balance against delivery. Payment delays will pause installation times.' : 'Cotización válida por 30 días. Requiere anticipo para inicio y saldo contra entrega. Retrasos en los pagos pausarán los tiempos de instalación.')
                      }</p>
                    </div>
                    <div>
                      <p className="font-bold mb-0.5">{isGeneral ? (isEn ? '6. CONFIDENTIALITY' : '6. CONFIDENCIALIDAD') : (isEn ? '6. INTELLECTUAL PROPERTY' : '6. PROPIEDAD INTELECTUAL')}</p>
                      <p>{isGeneral
                        ? (isEn ? 'The commercial information and prices contained in this document are confidential and property of Zirian. Distribution is prohibited.' : 'La información comercial y precios contenidos en este documento son confidenciales y propiedad de Zirian, prohibida su distribución sin autorización.')
                        : (isEn ? 'Engineering and designs provided are the intellectual property of Zirian. Reproduction or distribution without authorization is prohibited.' : 'La ingeniería y diseños proporcionados son propiedad intelectual de Zirian. Queda prohibida su reproducción o distribución sin autorización.')
                      }</p>
                    </div>
                  </div>
                </div>

                {/* Absolute bottom footer */}
                <div className="px-12 pb-4 pt-1">
                  <div className="bg-[#25B150] text-white text-[8px] font-bold flex justify-between items-center py-1 px-3 w-full">
                    <span>{isEn ? 'Page 1' : 'Página 1'}</span>
                    <span>{new Date().toLocaleDateString(isEn ? 'en-US' : 'es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                  </div>
                </div>

                </div>
              </div>
              );
            })()}
            </div>
          </div>
            {attachments && attachments.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-4 px-12 pb-8">
                <h4 className="text-[#1C497B] font-bold text-sm mb-2">Documentos Anexos a la Cotización:</h4>
                <ul className="list-disc list-inside text-xs text-slate-600">
                  {attachments.map((a: any) => (
                    <li key={a.id}>{a.name} (Se adjuntará en el PDF final)</li>
                  ))}
                </ul>
              </div>
            )}

            </Card>
    </div>
  );
}
